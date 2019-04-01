const fs = require('fs')
const yaml = require('js-yaml')

module.exports = componentDefinitionPath => {
  const data = yaml.safeLoad(fs.readFileSync(componentDefinitionPath, 'utf8'))

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  const clients = data.clients || []
  const connectionTypes = data.connectionTypes || []
  const syncConnections = data.syncConnections || []

  return { components, clients, connectionTypes, syncConnections }
}
