import type { Meta, StoryObj } from '@storybook/vue3'

import Input from './input.vue'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    // @ts-ignore
    placeholder: 'Placeholder',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: `
    <Input v-bind="args">
      <template v-if="${'prefix' in args}" #prefix="prefix">${args.prefix}</template>
      <template v-if="${'postfix' in args}" #postfix="postfix">${args.postfix}</template>
    </Input>
    `,
  }),
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPrefix: Story = {
  args: {
    prefix: 'Value:',
  },
}

export const WithPostfix: Story = {
  args: {
    postfix: 'km',
  },
}
