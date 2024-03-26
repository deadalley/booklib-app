import type { Meta, StoryObj } from '@storybook/vue3'

import BookImage from './book-image.vue'

const meta = {
  title: 'Components/Book Image',
  component: BookImage,
  tags: ['autodocs'],
  args: {
    bookId: 'bookId123',
    alt: 'Book Title',
    editing: false,
  },
  render: (args) => ({
    components: { BookImage },
    setup() {
      return { args }
    },
    template: '<div class="h-[500px] w-[300px]"><BookImage /></div>',
  }),
} satisfies Meta<typeof BookImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
