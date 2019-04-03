const fs = require('fs')
const yaml = require('js-yaml')

module.exports = {
  load: configPath => yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
}
