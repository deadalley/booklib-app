import type { Meta, StoryObj } from '@storybook/vue3'

import Loading from './loading.vue'

const meta = {
  title: 'Components/Loading',
  component: Loading,
  tags: ['autodocs'],
} satisfies Meta<typeof Loading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Big: Story = {
  render: (args) => ({
    components: { Loading },
    setup() {
      return { args }
    },
    template: '<Loading class="!w-12 !h-12" />',
  }),
}

export const CustomColors: Story = {
  render: (args) => ({
    components: { Loading },
    setup() {
      return { args }
    },
    template: '<Loading class="!dark:text-accent-light !fill-accent-dark" />',
  }),
}
