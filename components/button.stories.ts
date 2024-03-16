import type { Meta, StoryObj } from '@storybook/vue3'

import Button from './button.vue'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Click Me!</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const PrimaryCompact: Story = {
  args: {
    variant: 'primary',
    compact: true,
  },
}

export const SecondaryCompact: Story = {
  args: {
    variant: 'secondary',
    compact: true,
  },
}

export const DisabledCompact: Story = {
  args: {
    disabled: true,
    compact: true,
  },
}
