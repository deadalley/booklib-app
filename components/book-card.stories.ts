import type { Meta, StoryObj } from '@storybook/vue3'

import BookCard from './book-card.vue'
import { buildBook } from '../utils'

const meta = {
  title: 'Components/Book Card',
  component: BookCard,
  tags: ['autodocs'],
  args: {
    book: buildBook(),
  },
} satisfies Meta<typeof BookCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selectable: Story = { args: { selectable: true } }
