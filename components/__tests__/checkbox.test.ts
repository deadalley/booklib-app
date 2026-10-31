import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from '../checkbox.vue'

describe('checkbox', () => {
  it('emits change exactly once per click on the input', async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false },
      attachTo: document.body,
    })
    ;(wrapper.find('input').element as HTMLInputElement).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toEqual([[true]])
    wrapper.unmount()
  })

  it('emits once when the label text is clicked', async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false },
      slots: { default: 'Penguin' },
      attachTo: document.body,
    })
    ;(wrapper.find('span').element as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toHaveLength(1)
    wrapper.unmount()
  })

  it('reflects a parent-controlled checked state, including resets', async () => {
    const wrapper = mount(Checkbox, { props: { checked: true } })
    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.checked).toBe(true)
    await wrapper.setProps({ checked: false })
    expect(input.checked).toBe(false)
  })

  it('supports v-model', async () => {
    const wrapper: ReturnType<typeof mount<typeof Checkbox>> = mount(Checkbox, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean | undefined): Promise<void> =>
          wrapper.setProps({ modelValue: value }),
      },
    })
    await wrapper.find('input').setValue(true)
    expect(wrapper.props('modelValue')).toBe(true)
  })
})
