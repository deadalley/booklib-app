import type { Meta, StoryObj } from '@storybook/vue3'

import EmptyBookImage from './empty-book-image.vue'

const meta = {
  title: 'Components/Empty Book Image',
  component: EmptyBookImage,
  tags: ['autodocs'],
  render: (args) => ({
    components: { EmptyBookImage },
    setup() {
      return { args }
    },
    template: '<div class="h-[500px] w-[300px]"><EmptyBookImage /></div>',
  }),
} satisfies Meta<typeof EmptyBookImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
