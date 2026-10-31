import type { icons } from '@tabler/icons-vue'
import type {
  BookFormat,
  BookProgressStatus,
  BookPropertyStatus,
} from '~/types/book'
import type { GoalInterval, GoalPeriodUnit, GoalType } from '~/types/goal'

export const FAVORITE_COLLECTION_ID = 'favorite'
export const TBR_COLLECTION_ID = 'tbr'
export const WISHLIST_COLLECTION_ID = 'wishlist'
export const DEFAULT_COLLECTIONS = [
  FAVORITE_COLLECTION_ID,
  TBR_COLLECTION_ID,
  WISHLIST_COLLECTION_ID,
]

export const DEFAULT_COLLECTION_ICONS: Record<string, keyof typeof icons> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeart',
  [TBR_COLLECTION_ID]: 'IconStack2',
  [WISHLIST_COLLECTION_ID]: 'IconGift',
}

export const DEFAULT_COLLECTION_ICONS_FILLED: Record<
  string,
  keyof typeof icons
> = {
  [FAVORITE_COLLECTION_ID]: 'IconHeartFilled',
  [TBR_COLLECTION_ID]: 'IconStack2Filled',
  [WISHLIST_COLLECTION_ID]: 'IconGiftFilled',
}

export const DEFAULT_COLLECTION_TOGGLE_LABELS: Record<
  string,
  { on: string; off: string }
> = {
  [FAVORITE_COLLECTION_ID]: { on: 'Favorited', off: 'Favorite' },
  [TBR_COLLECTION_ID]: { on: 'In To Be Read', off: 'To Be Read' },
  [WISHLIST_COLLECTION_ID]: { on: 'In Wishlist', off: 'Wishlist' },
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
  {
    id: WISHLIST_COLLECTION_ID,
    name: 'Wishlist',
  },
]

export const BOOKS_PAGE_SIZE = 44
export const COLLECTIONS_PAGE_SIZE = 15
export const AUTHORS_PAGE_SIZE = 15

export const ICON_SIZE_SMALL = 20
export const ICON_SIZE_MEDIUM = 22
export const ICON_SIZE_LARGE = 26

export const PROGRESS_STATUS = ['reading', 'paused', 'read', 'not-finished']

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
  { id: GoalInterval; description: string; unit?: GoalPeriodUnit }
> = {
  daily: {
    id: 'daily',
    unit: 'day',
    description: 'per day',
  },
  weekly: {
    id: 'weekly',
    unit: 'week',
    description: 'per week',
  },
  monthly: {
    id: 'monthly',
    unit: 'month',
    description: 'per month',
  },
  yearly: {
    id: 'yearly',
    unit: 'year',
    description: 'per year',
  },
  total: {
    id: 'total',
    description: 'in total',
  },
}

export const GOAL_STATUS = ['tracking', 'not-tracking']
