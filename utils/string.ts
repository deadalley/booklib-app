export function snakeCaseToCamelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    )
}

export function snakeCaseToKebabCase(str: string) {
  return str.toLowerCase().replace('_', '-')
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
