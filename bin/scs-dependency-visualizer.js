#!/usr/bin/env node
require('dotenv').config()

const path = require('path')
const fs = require('fs')
const args = require('args')

args.option(
  'component-definition',
  'the component configuration that the resulting graph will based on.',
  '',
  val => {
    if (val === '') {
      throw new Error('Option "--component-definition" or "-c" is mandatory')
    }

    return val
  }
)

args.option(
  'port',
  'the server port, where the service is listening to. Manually exporting PORT also works'
)

const flags = args.parse(process.argv)

const componentDefinitionPath = path.resolve(
  process.cwd(),
  flags.componentDefinition
)

if (!fs.existsSync(componentDefinitionPath)) {
  throw new Error(
    `Component definition in ${componentDefinitionPath} is not existing`
  )
}

const dependencyVisualizer = require('../server/index.js')(
  componentDefinitionPath
)

const port = flags.port || process.env.PORT

if (!port) {
  throw new Error(
    'environment variable for "PORT" or command-line arg --port / -p is missing'
  )
}

dependencyVisualizer.bindStaticAssets()

dependencyVisualizer.app.listen(port, () => {
  console.log(`listen to ${port}`)
})
