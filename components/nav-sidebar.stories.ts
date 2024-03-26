import type { Meta, StoryObj } from '@storybook/vue3'

import NavSidebar from './nav-sidebar.vue'

const meta = {
  title: 'Components/Nav Sidebar',
  component: NavSidebar,
  tags: ['autodocs'],
  render: (args) => ({
    components: { NavSidebar },
    setup() {
      return { args }
    },
    template:
      '<div class="h-[800px] w-[300px]"><nav-sidebar v-bind="args">Click Me!</nav-sidebar></div>',
  }),
} satisfies Meta<typeof NavSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
