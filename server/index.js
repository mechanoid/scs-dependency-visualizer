require('dotenv').config()

const express = require('express')
const path = require('path')
const slug = require('slug')

const app = require('./lib/app.js').app
const definitionController = require('./lib/definition-controller.js')
const configLoader = require('./lib/config-loader.js')

module.exports = (configPath, options) => {
  if (options.static) {
    const dirPath = path.resolve(process.cwd(), options.static.fileDirectory)

    app.use(options.static.mountPath, express.static(dirPath))
  }

  const config = configLoader.load(configPath)

  if (!config.definitions) {
    // TODO: validate with schema
    throw new Error('provided config does not contain any definitions')
  }

  buildRoutesForDefinitions(app, config)

  return {
    app,
    bindStaticAssets: require('./lib/app.js').bindStaticAssets
  }
}

function buildRoutesForDefinitions (app, config, rootConfig = config) {
  const currentRootPath = config.rootPath || ''

  config.definitions.forEach((definition, index) => {
    const controller = definitionController(definition, definition.href, {
      appPath: app.path(),
      rootConfig
    })

    const pathSegment = definition.slug || slug(definition.name)

    if (pathSegment === 'resources') {
      throw new Error('definition name resources is not allowed')
    }

    const fullPath = path.join(currentRootPath, pathSegment)

    if (index === 0) {
      app.get(`/`, controller.flowDiagramController)
      app.get(`/resources`, controller.sequenceDiagramController)
    }

    app.get(`/${fullPath}`, controller.flowDiagramController)
    app.get(`/${fullPath}/resources`, controller.sequenceDiagramController)

    definition.definitions &&
      buildRoutesForDefinitions(
        app,
        Object.assign({}, definition, { rootPath: fullPath }),
        config
      )
  })
}
