import type { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'

export const WISHLIST_COLLECTION_ID = 'wishlist'
export const FAVORITE_COLLECTION_ID = 'favorite'
export const DEFAULT_COLLECTIONS = [
  FAVORITE_COLLECTION_ID,
  WISHLIST_COLLECTION_ID,
]

export const DEFAULT_COLLECTION_ICONS: Record<string, keyof typeof icons> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeart',
  [WISHLIST_COLLECTION_ID]: 'IconGift',
}

export const DEFAULT_COLLECTION_ICONS_FILLED: Record<
  string,
  keyof typeof icons
> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeartFilled',
  [WISHLIST_COLLECTION_ID]: 'IconGiftFilled',
}

export const DEFAULT_COLLECTIONS_INIT = [
  {
    id: WISHLIST_COLLECTION_ID,
    name: 'Wishlist',
  },
  {
    id: FAVORITE_COLLECTION_ID,
    name: 'Favorites',
  },
]

export const BOOKS_PAGE_SIZE = 44
export const COLLECTIONS_PAGE_SIZE = 15
export const AUTHORS_PAGE_SIZE = 15

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
  'not-owned': {
    id: 'not-owned',
    step: 1,
    description: 'Not owned',
    icon: 'IconArchiveOff',
  },
  owned: {
    id: 'owned',
    step: 1,
    description: 'Owned',
    icon: 'IconArchive',
  },
  'not-read': {
    id: 'not-read',
    step: 2,
    description: 'Not read',
    icon: 'IconBook2',
  },
  reading: {
    id: 'reading',
    step: 2,
    description: 'Reading',
    icon: 'IconEyeglass2',
  },
  paused: {
    id: 'paused',
    step: 2,
    description: 'Paused',
    icon: 'IconPlayerPause',
  },
  read: {
    id: 'read',
    step: 3,
    description: 'Read',
    icon: 'IconBook',
  },
  'not-finished': {
    id: 'not-finished',
    step: 3,
    description: 'Not finished',
    icon: 'IconBookOff',
  },
}
