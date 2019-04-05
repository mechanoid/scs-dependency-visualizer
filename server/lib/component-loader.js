const URL = require('url').URL
const base64 = require('base-64')

const yaml = require('js-yaml')
const fetch = require('node-fetch')

const resolve = async (
  componentDefinition,
  secretConfig,
  customHeaders = {}
) => {
  const headers = Object.assign({}, customHeaders, secretConfig)

  const options = {
    redirect: 'follow',
    headers
  }

  return fetch(componentDefinition.href, options)
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
}

const getCredentials = secretConfig =>
  secretConfig['env-based']
    ? [secretConfig['env-based'], true]
    : [secretConfig['config'], false]

const basicAuthSecret = secretConfig => {
  const [credentials, isEnvBased] = getCredentials(secretConfig)

  const userName = isEnvBased ? process.env[credentials.user] : credentials.user
  const password = isEnvBased
    ? process.env[credentials.password]
    : credentials.password

  if (!userName || !password) {
    throw new Error(`secret "${secretConfig.name}" is missing user or password`)
  }

  return {
    Authorization: `basic ${base64.encode(`${userName}:${password}`)}`
  }
}

const cookieSecret = secretConfig => {
  const [credentials, isEnvBased] = getCredentials(secretConfig)

  const cookieName = isEnvBased
    ? process.env[credentials.cookieName]
    : credentials.cookieName

  const cookieValue = isEnvBased
    ? process.env[credentials.cookieValue]
    : credentials.cookieValue

  if (!cookieName || !cookieValue) {
    throw new Error(
      `secret "${secretConfig.name}" is missing cookieName or cookieValue`
    )
  }

  return {
    Cookie: `${cookieName}=${cookieValue}`
  }
}

const secretConfigForDefinition = (secret, secrets) => {
  if (secret && secrets) {
    if (!secrets || !secrets[secret]) {
      throw new Error(
        `secret with name "${secret}" is not available in secrets`
      )
    }

    const secretConfig = secrets[secret]
    secretConfig.name = secret

    switch (secretConfig.type) {
      case 'basic-auth':
        return basicAuthSecret(secretConfig)
      case 'cookie-secret':
        return cookieSecret(secretConfig)
    }

    return secretConfig
  }

  return {}
}

module.exports = async (
  componentDefinitionUrl,
  { host, config, rootConfig }
) => {
  const absoluteUrl = new URL(componentDefinitionUrl, host) // if componentDefinitionUrl is absolute, baseUrl host is ignored

  const secretConfig = secretConfigForDefinition(
    config.secret,
    rootConfig.secrets
  )

  const data = await resolve(absoluteUrl, secretConfig)

  const components = (data.components || []).map(c => {
    c.filterable = true // only root level components can be filtered out
    return c
  })

  const clients = data.clients || []
  const connectionTypes = data.connectionTypes || []
  const syncConnections = data.syncConnections || []

  return { components, clients, connectionTypes, syncConnections }
}
