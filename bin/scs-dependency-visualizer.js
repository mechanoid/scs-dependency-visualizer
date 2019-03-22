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

const app = require('../server/index.js')(componentDefinitionPath)

if (!process.env.PORT) {
  throw new Error('environment variable for "PORT" is missing')
}

app.listen(process.env.PORT, () => {
  console.log(`listen to ${process.env.PORT}`)
})
