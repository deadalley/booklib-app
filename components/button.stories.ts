import type { Meta, StoryObj } from '@storybook/vue3'
import { IconPlus } from '@tabler/icons-vue'

import Button from './button.vue'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  render: (args) => ({
    components: { Button, IconPlus },
    setup() {
      return { args }
    },
    template: `
    <Button v-bind="args">
      Click Me!
      <template v-if="${'prependIcon' in args}" #prependIcon="prependIcon">${args.prependIcon}</template>
      <template v-if="${'appendIcon' in args}" #appendIcon="appendIcon">${args.appendIcon}</template>
    </Button>
    `,
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

export const WithPrependIcon: Story = {
  args: {
    prependIcon: '<IconPlus v-bind="prependIcon" />',
  },
}

export const WithAppendIcon: Story = {
  args: {
    appendIcon: '<IconPlus v-bind="appendIcon" />',
  },
}

export const WithPrependIconCompact: Story = {
  args: {
    compact: true,
    prependIcon: '<IconPlus v-bind="prependIcon" />',
  },
}

export const WithAppendIconCompact: Story = {
  args: {
    compact: true,
    appendIcon: '<IconPlus v-bind="appendIcon" />',
  },
}
