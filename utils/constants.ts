import type { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'

export const ICON_SIZE_SMALL = 20
export const ICON_SIZE_MEDIUM = 22

export const PROGRESS_STATUS_MAP: Record<
  BookProgressStatus,
  {
    id: BookProgressStatus
    description: string
    step: number
    icon: keyof typeof icons
  }
> = {
  wishlist: {
    id: 'wishlist',
    step: 1,
    description: 'Wishlist',
    icon: 'IconGift',
  },
  owned: {
    id: 'owned',
    step: 1,
    description: 'Owned',
    icon: 'IconArchive',
  },
  'not-read': {
    id: 'not-read',
    step: 1,
    description: 'Not read',
    icon: 'IconBook2',
  },
  queued: {
    id: 'queued',
    step: 2,
    description: 'Queued',
    icon: 'IconStackPush',
  },
  reading: {
    id: 'reading',
    step: 3,
    description: 'Reading',
    icon: 'IconEyeglass2',
  },
  paused: {
    id: 'paused',
    step: 3,
    description: 'Paused',
    icon: 'IconPlayerPause',
  },
  read: {
    id: 'read',
    step: 4,
    description: 'Read',
    icon: 'IconBook',
  },
  'not-finished': {
    id: 'not-finished',
    step: 4,
    description: 'Not finished',
    icon: 'IconBookOff',
  },
}
