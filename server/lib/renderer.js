const tabsForLayer = require('./helpers.js').tabsForLayer

const renderComponentsDependencies = require('./dependency-renderer.js')

const renderComponent = (component, filters, layer) => {
  if (component.type && component.type === 'group') {
    return `
${tabsForLayer(layer)}subgraph ${component.name}
${tabsForLayer(layer)}${component.components &&
      component.components
        .map(c => renderComponent(c, filters, layer + 1))
        .join(`\n${tabsForLayer(layer)}`)}
${tabsForLayer(layer)}end
`
  }

  return `${tabsForLayer(layer)}${component.name}`
}

const renderComponents = (components, filters) => {
  return components.map(c => renderComponent(c, filters, 0)).join('\n')
}

const componentIsNotUnselected = filters => c =>
  !c.filterable || // component isn't filterable at all. Only root components are set as filterable
  (!filters.filterComponents ||
    (filters.filterComponents && filters.filterComponents.length === 0)) || // component filters are empty
  (filters.filterComponents && filters.filterComponents.indexOf(c.name) >= 0) // component is part of the selected components

const clientIsNotFiltered = filters => component =>
  !component.clientType ||
  (component.clientType &&
    filters.client &&
    component.clientType === filters.client)

const renderStage = (components, filters) => {
  const filteredComponents = components
    .filter(clientIsNotFiltered(filters))
    .filter(componentIsNotUnselected(filters))

  return `graph TD
${renderComponents(filteredComponents, filters)}
${renderComponentsDependencies(filteredComponents, filters)}`
}

module.exports = renderStage
