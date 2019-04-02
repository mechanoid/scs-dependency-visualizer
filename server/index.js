require('dotenv').config()

module.exports = defaultComponentDefinition => {
  const app = require('./lib/app.js').app

  const controller = require('./lib/controller.js')(
    app,
    defaultComponentDefinition
  )

  app.get('/', controller.flowDiagramController)

  app.get('/resources', controller.sequenceDiagramController)

  return {
    app,
    bindStaticAssets: require('./lib/app.js').bindStaticAssets
  }
}
