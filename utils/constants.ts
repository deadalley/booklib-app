import type { icons } from '@tabler/icons-vue'
import type { BookFormat, BookProgressStatus, BookPropertyStatus } from '~/types/book'
import type { GoalInterval, GoalType } from '~/types/goal'

export const FAVORITE_COLLECTION_ID = 'favorite'
export const TBR_COLLECTION_ID = 'tbr'
export const DEFAULT_COLLECTIONS = [
  FAVORITE_COLLECTION_ID,
  TBR_COLLECTION_ID,
]

export const DEFAULT_COLLECTION_ICONS: Record<string, keyof typeof icons> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeart',
  [TBR_COLLECTION_ID]: 'IconStack2',
}

export const DEFAULT_COLLECTION_ICONS_FILLED: Record<
  string,
  keyof typeof icons
> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeartFilled',
  [TBR_COLLECTION_ID]: 'IconStack2Filled',
}

export const DEFAULT_COLLECTIONS_INIT = [
  {
    id: FAVORITE_COLLECTION_ID,
    name: 'Favorites',
  },
  {
    id: TBR_COLLECTION_ID,
    name: 'To Be Read',
  },
]

export const BOOKS_PAGE_SIZE = 44
export const COLLECTIONS_PAGE_SIZE = 15
export const AUTHORS_PAGE_SIZE = 15

export const ICON_SIZE_SMALL = 20
export const ICON_SIZE_MEDIUM = 22
export const ICON_SIZE_LARGE = 26

export const PROGRESS_STATUS = [
  'reading',
  'paused',
  'read',
  'not-finished',
]

export const PROGRESS_STATUS_MAP: Record<
  BookProgressStatus,
  {
    id: BookProgressStatus
    description: string
    step: number
    icon: keyof typeof icons
  }
> = {
  reading: {
    id: 'reading',
    step: 1,
    description: 'Reading',
    icon: 'IconNotes',
  },
  paused: {
    id: 'paused',
    step: 1,
    description: 'Paused',
    icon: 'IconPlayerPause',
  },
  read: {
    id: 'read',
    step: 2,
    description: 'Read',
    icon: 'IconBook',
  },
  'not-finished': {
    id: 'not-finished',
    step: 2,
    description: 'Not finished',
    icon: 'IconBookOff',
  },
}

export const PROPERTY_STATUS_MAP: Record<
  BookPropertyStatus,
  {
    id: BookPropertyStatus
    description: string
    icon: keyof typeof icons
  }
> = {
  'not-owned': {
    id: 'not-owned',
    description: 'Not owned',
    icon: 'IconArchiveOff',
  },
  owned: {
    id: 'owned',
    description: 'Owned',
    icon: 'IconArchive',
  },
  wishlist: {
    id: 'wishlist',
    description: 'Wishlist',
    icon: 'IconGift',
  },
}

export const BOOK_FORMAT = [
  'hardcover',
  'paperback',
  'ebook',
  'audiobook',
  'other',
]

export const BOOK_FORMAT_MAP: Record<
  BookFormat,
  {
    id: BookFormat
    description: string
    icon: keyof typeof icons
  }
> = {
  hardcover: {
    id: 'hardcover',
    description: 'Hardcover',
    icon: 'IconBook2',
  },
  paperback: {
    id: 'paperback',
    description: 'Paperback',
    icon: 'IconFileDescription',
  },
  ebook: {
    id: 'ebook',
    description: 'E-book',
    icon: 'IconDeviceTablet',
  },
  audiobook: {
    id: 'audiobook',
    description: 'Audiobook',
    icon: 'IconHeadphones',
  },
  other: {
    id: 'other',
    description: 'Other',
    icon: 'IconDeviceUnknown',
  },
}

export const GOAL_TYPE = ['books', 'pages', 'hours']

export const GOAL_TYPE_MAP: Record<
  GoalType,
  {
    id: GoalType
    description: string
    icon: keyof typeof icons
  }
> = {
  books: {
    id: 'books',
    description: 'Books',
    icon: 'IconBooks',
  },
  pages: {
    id: 'pages',
    description: 'Pages',
    icon: 'IconFileDescription',
  },
  hours: {
    id: 'hours',
    description: 'Hours',
    icon: 'IconClockHour4',
  },
}

export const GOAL_INTERVAL = ['daily', 'weekly', 'monthly', 'yearly', 'total']

export const GOAL_INTERVAL_MAP: Record<
  GoalInterval,
  { id: GoalInterval; description: string }
> = {
  daily: {
    id: 'daily',
    description: 'per day',
  },
  weekly: {
    id: 'weekly',
    description: 'per week',
  },
  monthly: {
    id: 'monthly',
    description: 'per month',
  },
  yearly: {
    id: 'yearly',
    description: 'per year',
  },
  total: {
    id: 'total',
    description: 'in total',
  },
}

export const GOAL_STATUS = ['tracking', 'not-tracking']
