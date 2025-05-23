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

export function camelCaseToSnakeCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
