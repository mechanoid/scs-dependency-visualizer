const renderer = require('./renderer.js')
const resourceRenderer = require('./resource-renderer.js')
const componentLoader = require('./component-loader.js')

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

module.exports = (app, defaultComponentDefinition) => ({
  flowDiagramController: async (req, res, next) => {
    try {
      const { components, clients, connectionTypes } = await componentLoader(
        defaultComponentDefinition
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
        appPath: app.path(),
        req
      })
    } catch (e) {
      next(e)
    }
  },

  sequenceDiagramController: async (req, res, next) => {
    try {
      const { components, syncConnections } = await componentLoader(
        defaultComponentDefinition
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
        appPath: app.path(),
        req
      })
    } catch (e) {
      next(e)
    }
  }
})
