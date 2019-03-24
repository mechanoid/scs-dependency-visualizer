require('dotenv').config()

const fs = require('fs')
const yaml = require('js-yaml')

const renderer = require('./lib/renderer.js')
const resourceRenderer = require('./lib/resource-renderer.js')

module.exports = componentDefinitionPath => {
  const app = require('./lib/app.js').app

  const data = yaml.safeLoad(fs.readFileSync(componentDefinitionPath, 'utf8'))

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  const clients = data.clients || []
  const connectionTypes = data.connectionTypes || []

  app.get('/', (req, res) => {
    const { client, connections, filterComponents } = req.query
    const filters = { client, connections, filterComponents }
    filters.client = filters.client || clients[0]
    const rendered = renderer(components, filters)

    res.render('index.pug', {
      clients,
      connectionTypes,
      rendered,
      filters,
      components,
      appPath: app.path()
    })
  })

  const componentsWithResources = c => {
    return (c.components || [])
      .reduce((memo, c) => memo.concat(componentsWithResources(c)), [])
      .concat(c.resources ? c : [])
      .filter(isNotEmptyArray)
  }

  app.get('/resources', (req, res) => {
    const { selectedComponent } = req.query

    const resourceComponents = components
      .reduce((memo, c) => memo.concat(componentsWithResources(c)), [])
      .filter(isNotEmptyArray)

    const component = selectedComponent
      ? resourceComponents.find(c => c.name === selectedComponent)
      : resourceComponents[0]

    const rendered = resourceRenderer(resourceComponents, component)

    res.render('resource.pug', {
      rendered,
      selectedComponent,
      resourceComponents,
      appPath: app.path()
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
