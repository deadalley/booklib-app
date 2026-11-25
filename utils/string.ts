export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** A file-name-safe version of a title: "The Left Hand" → "the-left-hand" */
export function slugify(text: string) {
  return (
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'booklib'
  )
}
