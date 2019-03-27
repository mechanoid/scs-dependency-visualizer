const keyName = name => name.replace(/[^a-zA-Z ]/g, '')

const renderResources = (components, syncConnections) => {
  const typedConnection = dep =>
    !dep.type || syncConnections.indexOf(dep.type) >= 0 ? '->>' : '-->>'

  const renderSequenceForDependency = (component, res) => dep => {
    const targetComponent = components.find(c => c.name === dep.component)
    const targetResource =
      targetComponent &&
      targetComponent.resources.find(r => r.relName === dep.relName)
    return `
  participant ${keyName(dep.component)} as ${dep.component}

    ${keyName(component.name)} ${typedConnection(dep)} ${keyName(
  dep.component
)}: ${dep.relName}
    activate ${keyName(dep.component)}

  ${targetResource ? renderResource(targetComponent, targetResource) : ''}

  ${keyName(dep.component)} ${typedConnection(dep)} ${keyName(
  component.name
)}: ${dep.relName}

  deactivate ${keyName(dep.component)}
`
  }

  const renderResource = (component, r, root = false) => `
    ${
  root
    ? `<div class="mermaid">
      sequenceDiagram`
    : ''
}
        ${root ? `Note left of ${keyName(component.name)}: ${r.relName}` : ''}

        participant ${keyName(component.name)} as ${component.name}
        ${root ? `activate ${keyName(component.name)}` : ''}
        ${(r.dependencies || [])
    .map(renderSequenceForDependency(component, r))
    .join('\n')}
        ${root ? `deactivate ${keyName(component.name)}` : ''}
        ${root ? '</div>' : ''}
    `

  return component =>
    component.resources.map(r => renderResource(component, r, true)).join('\n')
}

module.exports = (components, component, syncConnections) =>
  renderResources(components, syncConnections)(component)
