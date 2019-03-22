const tabsForLayer = require('./helpers.js').tabsForLayer
const exists = require('./helpers.js').exists

const ssiStyle = index =>
  `linkStyle ${index} stroke:#00f,stroke-width:2px,stroke-dasharray:5;`
const csiStyle = index =>
  `linkStyle ${index} stroke:#f03,stroke-width:2px,stroke-dasharray:2;`

const filtersPropertyContainsItem = (item, filters, itemType, filterProperty) =>
  item[itemType] &&
  filters[filterProperty] &&
  filters[filterProperty].indexOf(item[itemType]) < 0

module.exports = (components, filters) => {
  let dependencyIndex = 0

  const renderDependency = (component, filters) => dependency => {
    if (
      filtersPropertyContainsItem(dependency, filters, 'type', 'connections')
    ) {
      return ''
    }

    const currentIndex = dependencyIndex
    dependencyIndex += 1

    if (dependency.type === 'csi') {
      return `${component.name} -. ${dependency.relName} .-> ${
        dependency.component
      }
    ${csiStyle(currentIndex)}`
    }
    if (dependency.type === 'ssi') {
      return `${component.name} -->|${dependency.relName}| ${
        dependency.component
      }
    ${ssiStyle(currentIndex)}`
    }

    return `${component.name} --> ${dependency.component}`
  }

  const renderResource = (component, filters) => resource => {
    if (!resource.dependencies) {
      return null
    }

    return resource.dependencies
      .map(renderDependency(component, filters))
      .join('\n')
  }

  const renderResources = (component, filters) => {
    if (!component.resources) {
      return null
    }

    return component.resources
      .map(renderResource(component, filters))
      .join('\n')
  }

  const renderDependencies = (component, filters) => {
    if (!component.dependencies) {
      return null
    }

    return component.dependencies
      .map(renderDependency(component, filters))
      .join('\n')
  }

  const renderComponentDependencies = (component, filters) => {
    if (
      filtersPropertyContainsItem(component, filters, 'clientType', 'clients')
    ) {
      return ''
    }

    return [
      component.components &&
        renderComponentsDependencies(component.components, filters),
      component.dependencies && renderDependencies(component, filters),
      component.resources && renderResources(component, filters)
    ]
      .filter(exists)
      .join('\n')
  }

  const componentIsSelected = filters => c => {
    if (!c.filterable) {
      return true
    }

    return (
      (filters.filterComponents && filters.filterComponents.length === 0) ||
      (filters.filterComponents &&
        filters.filterComponents.indexOf(c.name) >= 0)
    )
  }

  const renderComponentsDependencies = (components, filters) =>
    components
      .filter(componentIsSelected(filters))
      .map(c => renderComponentDependencies(c, filters))
      .filter(exists)
      .join('\n')

  const renderComponent = (component, filters, layer) => {
    if (
      component.clientType &&
      filters.clients &&
      filters.clients.indexOf(component.clientType) < 0
    ) {
      return ''
    }

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
    return components
      .filter(componentIsSelected(filters))
      .map(c => renderComponent(c, filters, 0))
      .join('\n')
  }

  const renderStage = (components, filters) => {
    return `graph TD
${renderComponents(components, filters)}
${renderComponentsDependencies(components, filters)}`
  }

  return renderStage(components, filters)
}
