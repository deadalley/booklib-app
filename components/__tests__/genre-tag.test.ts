import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GenreTag from '../genre-tag.vue'

describe('genre-tag', () => {
  it('renders the genre', async () => {
    const wrapper = await mountSuspended(GenreTag, {
      props: { genre: 'Science Fiction' },
    })
    expect(wrapper.text()).toContain('Science Fiction')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits remove from an accessible remove button', async () => {
    const wrapper = await mountSuspended(GenreTag, {
      props: { genre: 'Fantasy', removable: true },
    })
    const button = wrapper.get('button[aria-label="Remove Fantasy"]')
    await button.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})
