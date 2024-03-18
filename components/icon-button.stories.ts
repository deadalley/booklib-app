import type { Meta, StoryObj } from '@storybook/vue3'
import { IconHeart } from '@tabler/icons-vue'

import IconButton from './icon-button.vue'

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { IconButton, IconHeart },
    setup() {
      return { args }
    },
    template: `
    <IconButton v-bind="args">
      <template v-slot="iconProps">
        <IconHeart v-bind="iconProps" />
      </template>
    </IconButton>
    `,
  }),
} satisfies Meta<typeof IconButton>

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
