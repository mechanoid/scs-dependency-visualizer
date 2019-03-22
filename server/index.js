require('dotenv').config()

const fs = require('fs')
const yaml = require('js-yaml')

const renderer = require('./lib/renderer.js')

module.exports = componentDefinitionPath => {
  const app = require('./lib/app.js').app

  const data = yaml.safeLoad(fs.readFileSync(componentDefinitionPath, 'utf8'))

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  app.get('/', (req, res) => {
    const { client, connections, filterComponents } = req.query
    const filters = { client, connections, filterComponents }

    const rendered = renderer(components, filters)

    res.render('index.pug', {
      rendered,
      filters,
      components,
      appPath: app.path()
    })
  })

  return {
    app,
    bindStaticAssets: require('./lib/app.js').bindStaticAssets
  }
}
