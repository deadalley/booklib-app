import type { Meta, StoryObj } from '@storybook/vue3'

import Checkbox from './checkbox.vue'
import ListCheckbox from './list-checkbox.vue'
import ListCheckboxOption from './list-checkbox-option.vue'

const meta = {
  title: 'Components/List Checkbox',
  component: ListCheckbox,
  tags: ['autodocs'],
  render: (args) => ({
    components: { ListCheckbox, ListCheckboxOption, Checkbox },
    setup() {
      return { args }
    },
    template: `
      <ListCheckbox>
        <ListCheckboxOption value="item1">Item 1</ListCheckboxOption>
        <ListCheckboxOption value="item2">Item 2</ListCheckboxOption>
        <ListCheckboxOption value="item3">Item 3</ListCheckboxOption>
        <ListCheckboxOption value="item4">Item 4</ListCheckboxOption>
      </ListCheckbox>
    `,
  }),
} satisfies Meta<typeof ListCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
