import type { Meta, StoryObj } from '@storybook/vue3'

const meta = {
  title: 'Components/Typography',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Heading1: Story = {
  render: () => ({
    template: '<h1>Heading 1</h1>',
  }),
}

export const Heading2: Story = {
  render: () => ({
    template: '<h2>Heading 2</h2>',
  }),
}

export const Heading3: Story = {
  render: () => ({
    template: '<h3>Heading 3</h3>',
  }),
}

export const Heading4: Story = {
  render: () => ({
    template: '<h4>Heading 4</h4>',
  }),
}

export const Paragraph: Story = {
  render: () => ({
    template: '<p>Paragraph</p>',
  }),
}
