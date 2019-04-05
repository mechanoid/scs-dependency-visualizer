#!/usr/bin/env node
require('dotenv').config()

const path = require('path')
const fs = require('fs')
const args = require('args')

args.option(
  'config',
  'the definition configuration path. A file defining which component defintions are available.',
  '',
  val => {
    if (val === '') {
      throw new Error('Option "--config" or "-c" is mandatory')
    }

    return val
  }
)

args.option(
  'port',
  'the server port, where the service is listening to. Manually exporting PORT also works'
)

args.option(
  'static',
  `local path, relative to the invoked process, that will be served static in the mounted application root in the form of mount-path=folder-path`
)

const flags = args.parse(process.argv)

const configPath = path.resolve(process.cwd(), flags.config)

if (!fs.existsSync(configPath)) {
  throw new Error(
    `SCS Dependency Viewer Config in ${configPath} is not existing`
  )
}

const dependencyVisualizer = require('../server/index.js')(configPath, {
  static: staticMountConfig(flags)
})

dependencyVisualizer.bindStaticAssets()
dependencyVisualizer.bindRoutes()

const port = flags.port || process.env.PORT

if (!port) {
  throw new Error(
    'environment variable for "PORT" or command-line arg --port / -p is missing'
  )
}

dependencyVisualizer.app.listen(port, () => {
  console.log(`listen to ${port}`)
})

function staticMountConfig (flags) {
  if (!flags.static) {
    return null
  }

  const [mountPath, fileDirectory] = flags.static.split('=')

  if (!path.isAbsolute(mountPath)) {
    throw new Error(
      'mount-path fragment first part of --static / -s must be absolute'
    )
  }

  return {
    mountPath,
    fileDirectory
  }
}
