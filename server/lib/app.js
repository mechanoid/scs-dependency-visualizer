const express = require('express')
require('pug')

const path = require('path')
const app = express()

const rootPath = path.resolve(__dirname, '..', '..')

app.set('views', path.resolve(rootPath, 'server/views'))
app.set('view engine', 'pug')
app.set('x-powered-by', false)

module.exports = {
  app,
  bindStaticAssets: () => {
    app.use(
      '/scripts/mermaid.min.js',
      express.static(
        path.resolve(path.dirname(require.resolve('mermaid')), 'mermaid.min.js')
      )
    )

    app.use(
      '/scripts',
      express.static(path.resolve(rootPath, 'client/scripts'))
    )

    app.use('/css', express.static(path.resolve(rootPath, 'client/css')))
  }
}
