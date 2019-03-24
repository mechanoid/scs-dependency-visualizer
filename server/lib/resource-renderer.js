const keyName = name => name.replace(/[^a-zA-Z ]/g, '')

const renderResources = components => {
  const renderSequenceForDependency = (component, res) => dep => {
    const targetComponent = components.find(c => c.name === dep.component)
    const targetResource =
      targetComponent &&
      targetComponent.resources.find(r => r.relName === dep.relName)
    return `
  participant ${keyName(component.name)} as ${component.name}
  participant ${keyName(dep.component)} as ${dep.component}
  ${keyName(component.name)}->>${keyName(dep.component)}: ${dep.relName} ${
  dep.type ? `(${dep.type})` : ''
}

  ${targetResource ? renderResource(targetComponent, targetResource) : ''}`
  }

  const renderResource = (component, r) =>
    (r.dependencies || [])
      .map(renderSequenceForDependency(component, r))
      .join('\n')

  return component =>
    component.resources.map(r => renderResource(component, r)).join('\n')
}

module.exports = (components, component) => `
  sequenceDiagram
    ${renderResources(components)(component)}
`
