export function getRatingUnit(value: number): string {
  return Array(Math.floor(value))
    .fill('★')
    .concat(value % Math.floor(value) === 0.5 ? ['⯨'] : [])
    .join('')
}
