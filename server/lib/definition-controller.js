const URL = require('url').URL
const path = require('path')
const renderer = require('./renderer.js')
const resourceRenderer = require('./resource-renderer.js')
const componentLoader = require('./component-loader.js')
const slug = require('slug')

const isNotEmptyArray = item => {
  if (item instanceof Array) {
    return item.length > 0
  } else {
    return true
  }
}

const filterComponentWithResources = c => {
  return (c.components || [])
    .reduce((memo, c) => memo.concat(filterComponentWithResources(c)), [])
    .concat(c.resources ? c : [])
    .filter(isNotEmptyArray)
}

const filterComponentsWithResources = components =>
  components
    .reduce((memo, c) => memo.concat(filterComponentWithResources(c)), [])
    .filter(isNotEmptyArray) || []

const getSelectedOrFirstComponent = (selectedComponent, components) =>
  selectedComponent
    ? components.find(c => c.name === selectedComponent)
    : components[0]

const host = req =>
  `${req.protocol}://${req.headers['x-forwarded-host'] || req.headers.host}`

const stripPendingSlash = resultPath => resultPath.replace(/^(.*)\/$/, '$1')

const definitionPath = (uriPath, stripResources = true) => {
  const currentUrl = new URL(uriPath, 'http://fubar')
  if (stripResources) {
    return stripPendingSlash(
      currentUrl.pathname.replace(/(.*)\/resources\/?/, '$1')
    )
  } else {
    return stripPendingSlash(currentUrl.pathname)
  }
}

module.exports = (config, componentDefinitionUrl, { appPath, rootConfig }) => ({
  flowDiagramController: async (req, res, next) => {
    try {
      const { components, clients, connectionTypes } = await componentLoader(
        componentDefinitionUrl,
        { host: host(req), config, rootConfig }
      )

      const { client, connections, filterComponents } = req.query
      const hideFilters = req.query['hide-filters']
      const filters = { client, connections, filterComponents }
      filters.client = filters.client || clients[0]

      const rendered = renderer(components, filters)

      res.render('index.pug', {
        clients,
        connectionTypes,
        rendered,
        filters,
        components,
        hideFilters,
        appPath,
        req,
        config: rootConfig,
        slug,
        path,
        definitionPath
      })
    } catch (e) {
      next(e)
    }
  },

  sequenceDiagramController: async (req, res, next) => {
    try {
      const { components, syncConnections } = await componentLoader(
        componentDefinitionUrl,
        { host: host(req), config, rootConfig }
      )

      const { selectedComponent } = req.query
      const hideFilters = req.query['hide-filters']
      const resourceComponents = filterComponentsWithResources(components)

      const component = getSelectedOrFirstComponent(
        selectedComponent,
        resourceComponents
      )

      const rendered = component
        ? resourceRenderer(resourceComponents, component, syncConnections)
        : ''

      res.render('resource.pug', {
        rendered,
        selectedComponent,
        resourceComponents,
        hideFilters,
        appPath,
        req,
        config: rootConfig,
        slug,
        path,
        definitionPath
      })
    } catch (e) {
      next(e)
    }
  }
})
