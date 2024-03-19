import en from '@vueform/vueform/locales/en'
import tailwind from '@vueform/vueform/dist/tailwind'
import { defineConfig } from '@vueform/vueform'

const baseStyles: Record<string, string[]> = {
  wrapper: ['flex flex-col justify-end'],
  outerWrapper: ['flex flex-col gap-2'],
  inputContainer: ['flex items-center gap-3'],
  input: [
    'w-full px-5 rounded-m outline-none text-base placeholder:text-accent',
  ],
  label: ['text-base font-medium'],
}

export default defineConfig({
  classHelpers: true,
  theme: tailwind,
  locales: { en },
  locale: 'en',
  overrideClasses: {
    ElementLayout: {
      container: baseStyles.wrapper.join(' '),
      outerWrapper: baseStyles.outerWrapper.join(' '),
    },
    TextElement: {
      inputContainer: baseStyles.inputContainer.join(' '),
      input: [...baseStyles.input, 'py-3'].join(' '),
    },
    TextareaElement: {
      inputContainer: baseStyles.inputContainer.join(' '),
      input: [...baseStyles.input, 'py-5'].join(' '),
    },
    ElementLabel: {
      container: baseStyles.label.join(' '),
    },
    ElementLabelFloating: {
      container: 'hidden',
      label: 'hidden',
    },
    ElementAddon: {
      container: 'text-gray-dark',
    },
    FormElements: {
      container: 'form-container',
    },
  },
})
