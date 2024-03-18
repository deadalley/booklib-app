import type { Meta, StoryObj } from '@storybook/vue3'

import BookCard from './book-card.vue'

const meta = {
  title: 'Components/BookCard',
  component: BookCard,
  tags: ['autodocs'],
  args: {
    title: 'Book Title',
    author: 'Book Author',
    coverSrc: 'https://picsum.photos/160/220',
  },
} satisfies Meta<typeof BookCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
