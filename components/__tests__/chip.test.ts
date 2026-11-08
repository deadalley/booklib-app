import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Chip from '../chip.vue'

describe('chip', () => {
  it('renders its content without a remove button by default', async () => {
    const wrapper = await mountSuspended(Chip, {
      slots: { default: () => 'Science Fiction' },
    })
    expect(wrapper.text()).toContain('Science Fiction')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits remove from an accessible remove button', async () => {
    const wrapper = await mountSuspended(Chip, {
      props: { removable: true, removeLabel: 'Remove Fantasy' },
      slots: { default: () => 'Fantasy' },
    })
    const button = wrapper.get('button[aria-label="Remove Fantasy"]')
    await button.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})
