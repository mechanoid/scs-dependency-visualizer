require('dotenv').config()

const renderer = require('./lib/renderer.js')
const resourceRenderer = require('./lib/resource-renderer.js')
const componentLoader = require('./lib/component-loader.js')

const targetComponentsPath = defaultPath => req =>
  req.query['components-path'] || defaultPath

module.exports = defaultComponentDefinitionPath => {
  const app = require('./lib/app.js').app
  const componentsPath = targetComponentsPath(defaultComponentDefinitionPath)

  app.get('/', (req, res) => {
    const { components, clients, connectionTypes } = componentLoader(
      componentsPath(req)
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
  })

  const componentsWithResources = c => {
    return (c.components || [])
      .reduce((memo, c) => memo.concat(componentsWithResources(c)), [])
      .concat(c.resources ? c : [])
      .filter(isNotEmptyArray)
  }

  app.get('/resources', (req, res) => {
    const { components, syncConnections } = componentLoader(componentsPath(req))

    const { selectedComponent } = req.query
    const hideFilters = req.query['hide-filters']
    const resourceComponents =
      components
        .reduce((memo, c) => memo.concat(componentsWithResources(c)), [])
        .filter(isNotEmptyArray) || []

    const component = selectedComponent
      ? resourceComponents.find(c => c.name === selectedComponent)
      : resourceComponents[0]

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
  })

  return {
    app,
    bindStaticAssets: require('./lib/app.js').bindStaticAssets
  }
}

function isNotEmptyArray (item) {
  if (item instanceof Array) {
    return item.length > 0
  } else {
    return true
  }
}
