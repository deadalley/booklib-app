import type { Meta, StoryObj } from '@storybook/vue3'

import Modal from './modal.vue'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  render: (args) => ({
    components: { Modal },
    setup() {
      const isOpen = ref(true)

      function openModal() {
        isOpen.value = !isOpen
      }

      return { args, isOpen, openModal }
    },
    template: `
      <div>
        <button @click="openModal">Open</button>
        <Modal :is-open="isOpen" />
      </div>
    `,
  }),
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
