// The "Add book" chooser (manual entry or ISBN scan), shared by every
// "Add book" button. The modal itself lives in the dashboard layout.
const open = ref(false)

export function useAddBook() {
  return {
    addBookOpen: open,
    openAddBook: () => (open.value = true),
  }
}
