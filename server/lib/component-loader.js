const URL = require('url').URL

// const fs = require('fs')
const yaml = require('js-yaml')
const fetch = require('node-fetch')

const resolve = async componentDefinition =>
  fetch(componentDefinition)
    .then(res => {
      if (res.ok) {
        return res
      }

      throw new Error(
        `'Component Definition could not be loaded. Status: ${res.status}`
      )
    })
    .then(res => res.text())
    .then(text => yaml.safeLoad(text))

module.exports = async (componentDefinitionUrl, { host }) => {
  const absoluteUrl = new URL(componentDefinitionUrl, host) // if componentDefinitionUrl is absolute, baseUrl host is ignored

  const data = await resolve(absoluteUrl)

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  const clients = data.clients || []
  const connectionTypes = data.connectionTypes || []
  const syncConnections = data.syncConnections || []

  return { components, clients, connectionTypes, syncConnections }
}
