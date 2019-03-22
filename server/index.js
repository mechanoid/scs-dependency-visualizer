require('dotenv').config()

const fs = require('fs')
const yaml = require('js-yaml')

const app = require('./lib/app.js')

const renderer = require('./lib/renderer.js')

module.exports = componentDefinitionPath => {
  const data = yaml.safeLoad(fs.readFileSync(componentDefinitionPath, 'utf8'))

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  app.get('/', (req, res) => {
    const { clients, connections, filterComponents } = req.query
    const filters = { clients, connections, filterComponents }

    const rendered = renderer(components, filters)
    // console.log(clients)
    res.render('index.pug', {
      rendered,
      filters,
      components
    })
  })

  return app
}
