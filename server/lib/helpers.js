const tabsForLayer = layer => '  '.repeat(layer + 1)

const exists = item => !!item

module.exports = {
  tabsForLayer,
  exists
}
