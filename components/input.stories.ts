import type { Meta, StoryObj } from '@storybook/vue3'

import Input from './input.vue'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    // @ts-expect-error attrs are untyped
    label: 'Label',
    editing: true,
    placeholder: 'Placeholder',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: `
    <Input v-bind="args">
      <template v-if="${'prefix' in args}" #prefix="prefix">${(args as { prefix: string }).prefix}</template>
      <template v-if="${'postfix' in args}" #postfix="postfix">${(args as { postfix: string }).postfix}</template>
    </Input>
    `,
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPrefix: Story = {
  args: {
    // @ts-expect-error attrs are untyped
    prefix: 'Value:',
  },
}

export const WithPostfix: Story = {
  args: {
    // @ts-expect-error attrs are untyped
    postfix: 'km',
  },
}

export const NotEditing: Story = {
  args: {
    editing: false,
    // @ts-expect-error attrs are untyped
    value: 'Value 123',
  },
}
