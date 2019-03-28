const ssiStyle = index =>
  `linkStyle ${index} stroke:#00f,stroke-width:2px,stroke-dasharray:5;`
const csiStyle = index =>
  `linkStyle ${index} stroke:#f03,stroke-width:2px,stroke-dasharray:2;`

const dependencyIsNotFiltered = filters => dependency =>
  !dependency.type ||
  !filters.connections ||
  !filters.connections.length === 0 ||
  (dependency.type &&
    filters.connections &&
    filters.connections.indexOf(dependency.type) >= 0)

const renderDependencyWithIndex = () => {
  let dependencyIndex = 0

  return (component, filters) => dependency => {
    const currentIndex = dependencyIndex
    dependencyIndex += 1

    // TODO: as types are dynamic now. This has to be relied on a configuration as well.
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

    if (dependency.relName) {
      return `${component.name} -->|${dependency.relName}| ${
        dependency.component
      }`
    }

    return `${component.name} --> ${dependency.component}`
  }
}

const renderResource = (component, filters, renderDependency) => resource => {
  if (!resource.dependencies) {
    return null
  }

  return resource.dependencies
    .filter(dependencyIsNotFiltered(filters))
    .map(renderDependency(component, filters))
    .join('\n')
}

const renderResources = (component, filters, renderDependency) => {
  if (!component.resources) {
    return null
  }

  return component.resources
    .map(renderResource(component, filters, renderDependency))
    .join('\n')
}

const renderDependencies = (component, filters, renderDependency) => {
  if (!component.dependencies) {
    return null
  }

  return component.dependencies
    .filter(dependencyIsNotFiltered(filters))
    .map(renderDependency(component, filters))
    .join('\n')
}

const renderComponentDependencies = (component, filters, renderDependency) => {
  return [
    component.dependencies &&
      renderDependencies(component, filters, renderDependency),

    // TODO: make resource rendering in flow diagram toggleable
    component.resources &&
      renderResources(component, filters, renderDependency),

    component.components &&
      renderComponentsDependencies(
        component.components,
        filters,
        renderDependency
      )
  ].join('\n')
}

const renderComponentsDependencies = (components, filters, renderDependency) =>
  components
    .map(c => renderComponentDependencies(c, filters, renderDependency))
    .join('\n')

module.exports = (component, filters) => {
  return renderComponentsDependencies(
    component,
    filters,
    renderDependencyWithIndex()
  )
}
