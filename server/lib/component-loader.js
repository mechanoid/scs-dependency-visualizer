const fs = require('fs')
const yaml = require('js-yaml')
const fetch = require('node-fetch')

const resolve = async componentDefinition =>
  fetch(componentDefinition.uri).then(res => {
    if (res.ok) {
      return res
    }

    throw new Error(
      `'Component Definition could not be loaded. Status: ${res.status}`
    )
  })

module.exports = async componentDefinition => {
  const data =
    typeof componentDefinition === 'string'
      ? yaml.safeLoad(fs.readFileSync(componentDefinition, 'utf8'))
      : await resolve(componentDefinition)

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  const clients = data.clients || []
  const connectionTypes = data.connectionTypes || []
  const syncConnections = data.syncConnections || []

  return { components, clients, connectionTypes, syncConnections }
}
