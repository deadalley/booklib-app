import { describe, expect, it } from 'vitest'
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'
import {
  getFeaturedGoal,
  getGoalInfo,
  getGoalPaceUnit,
  getGoalPeriods,
  getGoalRangePreset,
  getGoalRequiredRate,
  getGoalStatus,
  getRepeatedGoal,
  getUnloggedGoalBooks,
  resolveGoal,
  stripAutoEntries,
} from './goal'
import { toSimpleDate } from './date'

function bookGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Read 12 books in 2026',
    type: 'books',
    interval: 'total',
    amount: 12,
    createdAt: '2026-01-01T00:00:00.000Z',
    startAt: '2026-01-01T00:00:00.000Z',
    finishAt: '2026-12-31T23:59:59.999Z',
    completedAt: null,
    status: 'tracking',
    author: null,
    genres: [],
    entries: [],
    ...overrides,
  } as Goal
}

function pageGoal(overrides: Partial<Goal> = {}): Goal {
  return bookGoal({
    title: '30 pages a day',
    type: 'pages',
    interval: 'daily',
    amount: 30,
    startAt: '2026-10-01',
    finishAt: '2026-10-31',
    ...overrides,
  } as Partial<Goal>)
}

function book(id: string, overrides: Partial<Book> = {}): Book {
  return {
    id,
    title: `Book ${id}`,
    author: 'a1',
    genres: ['Fiction'],
    progress: {
      status: 'read',
      finishedAt: '2026-03-10T00:00:00.000Z',
      startedAt: null,
      notes: [],
      currentPage: null,
    },
    ...overrides,
  } as Book
}

const entries = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `e${i}`,
    book: `b${i}`,
    createdAt: '2026-02-01',
  }))

describe('getGoalStatus', () => {
  it('uses the stored status while the goal runs', () => {
    expect(getGoalStatus(bookGoal(), '2026-06-01')).toBe('tracking')
    expect(
      getGoalStatus(bookGoal({ status: 'not-tracking' }), '2026-06-01'),
    ).toBe('not-tracking')
  })

  it('completes total goals early once the amount is reached', () => {
    const goal = bookGoal({ amount: 2, entries: entries(2) } as Partial<Goal>)
    expect(getGoalStatus(goal, '2026-06-01')).toBe('completed')
  })

  it('is completed or expired after the finish date', () => {
    expect(
      getGoalStatus(
        bookGoal({ amount: 2, entries: entries(2) } as Partial<Goal>),
        '2027-01-01',
      ),
    ).toBe('completed')
    expect(getGoalStatus(bookGoal(), '2027-01-01')).toBe('expired')
  })
})

describe('getGoalPeriods', () => {
  it('splits daily goals into days and sums entries per day', () => {
    const goal = pageGoal({
      entries: [
        { id: '1', pages: 10, createdAt: '2026-10-02T08:00:00.000Z' },
        { id: '2', pages: 25, createdAt: '2026-10-02' },
      ],
    } as Partial<Goal>)
    const periods = getGoalPeriods(goal)

    expect(periods).toHaveLength(31)
    expect(periods[1]).toEqual({
      start: '2026-10-02',
      end: '2026-10-02',
      value: 35,
    })
  })

  it('counts weeks from the start date and clips the last one', () => {
    const periods = getGoalPeriods(
      pageGoal({ interval: 'weekly', startAt: '2026-10-01' }),
    )
    expect(periods.map(({ start, end }) => [start, end])).toEqual([
      ['2026-10-01', '2026-10-07'],
      ['2026-10-08', '2026-10-14'],
      ['2026-10-15', '2026-10-21'],
      ['2026-10-22', '2026-10-28'],
      ['2026-10-29', '2026-10-31'],
    ])
  })

  it('uses calendar months', () => {
    const periods = getGoalPeriods(
      pageGoal({
        interval: 'monthly',
        startAt: '2026-01-15',
        finishAt: '2026-03-31',
      }),
    )
    expect(periods.map(({ start, end }) => [start, end])).toEqual([
      ['2026-01-15', '2026-01-31'],
      ['2026-02-01', '2026-02-28'],
      ['2026-03-01', '2026-03-31'],
    ])
  })
})

describe('getGoalInfo', () => {
  it('computes the pace offset for total goals', () => {
    const goal = bookGoal({ entries: entries(3) } as Partial<Goal>)
    const info = getGoalInfo(goal, '2026-07-02')

    expect(info.pct).toBe(25)
    expect(Math.round(info.timeFrac * 100)).toBe(50)
    expect(info.paceOffset).toBe(-3)
    expect(info.daysLeft).toBe(183)
  })

  it('counts hits and the streak for periodic goals', () => {
    const value = (dayOfMonth: number, pages: number) => ({
      id: String(dayOfMonth),
      pages,
      createdAt: `2026-10-${String(dayOfMonth).padStart(2, '0')}`,
    })
    const goal = pageGoal({
      entries: [value(1, 30), value(2, 10), value(3, 30), value(4, 40)],
    } as Partial<Goal>)

    const info = getGoalInfo(goal, '2026-10-05')
    expect(info.hit).toBe(3)
    expect(info.counted).toBe(4)
    expect(info.streak).toBe(2)
    expect(info.current?.start).toBe('2026-10-05')
    expect(info.pct).toBe(0)
  })
})

describe('pace', () => {
  it('picks the pace unit from the span', () => {
    expect(getGoalPaceUnit(bookGoal())).toBe('month')
    expect(
      getGoalPaceUnit(
        bookGoal({ startAt: '2026-01-01', finishAt: '2026-02-28' }),
      ),
    ).toBe('week')
    expect(
      getGoalPaceUnit(
        bookGoal({ startAt: '2026-01-01', finishAt: '2026-01-10' }),
      ),
    ).toBe('day')
  })

  it('computes the rate needed to finish', () => {
    const goal = bookGoal({ entries: entries(3) } as Partial<Goal>)
    const info = getGoalInfo(goal, '2026-07-02')
    expect(getGoalRequiredRate(goal, info)).toEqual({
      unit: 'month',
      value: 1.5,
    })
    expect(getGoalRequiredRate(goal, { ...info, status: 'not-tracking' })).toBe(
      null,
    )
  })
})

describe('auto-counting', () => {
  const books = [
    book('1'),
    book('2', { author: 'a2' }),
    book('3', { genres: ['Poetry'] }),
    book('4', {
      progress: { ...book('4').progress, finishedAt: '2025-12-31T00:00:00Z' },
    }),
    book('5', { progress: { ...book('5').progress, status: 'reading' } }),
  ]

  it('adds virtual entries for matching books finished in the window', () => {
    const goal = bookGoal({
      auto: true,
      author: 'a1',
      genres: ['Fiction'],
      entries: [{ id: 'm', book: '9', createdAt: '2026-01-02' }],
    } as Partial<Goal>)
    const resolved = resolveGoal(goal, books)

    expect(resolved.entries.map((entry) => entry.id)).toEqual(['m', 'auto-1'])
    expect(stripAutoEntries(resolved).entries).toEqual(goal.entries)
  })

  it('does not duplicate books that were logged by hand', () => {
    const goal = bookGoal({
      auto: true,
      entries: [{ id: 'm', book: '1', createdAt: '2026-03-10' }],
    } as Partial<Goal>)
    expect(resolveGoal(goal, books).entries.map((entry) => entry.id)).toEqual([
      'm',
      'auto-2',
      'auto-3',
    ])
  })

  it('leaves goals without auto-counting alone', () => {
    const goal = bookGoal()
    expect(resolveGoal(goal, books)).toBe(goal)
    expect(getUnloggedGoalBooks(goal, books).map(({ id }) => id)).toEqual([
      '1',
      '2',
      '3',
    ])
  })
})

describe('getRepeatedGoal', () => {
  it('moves full calendar years to the next year and updates the title', () => {
    const repeated = getRepeatedGoal(
      bookGoal({ entries: entries(4) } as Partial<Goal>),
      '2027-02-10',
    )
    expect(repeated).toMatchObject({
      title: 'Read 12 books in 2027',
      startAt: '2027-01-01',
      finishAt: '2027-12-31',
      status: 'tracking',
      entries: [],
    })
  })

  it('moves other spans forward until they end after today', () => {
    const repeated = getRepeatedGoal(
      pageGoal({ startAt: '2026-06-03', finishAt: '2026-07-02' }),
      '2026-08-15',
    )
    expect([repeated.startAt, repeated.finishAt]).toEqual([
      '2026-08-02',
      '2026-08-31',
    ])
  })

  it('repeats whole calendar months as calendar months', () => {
    // January (31 days) must repeat as February, not as Feb 1 – Mar 3
    expect(
      getRepeatedGoal(
        pageGoal({ startAt: '2026-01-01', finishAt: '2026-01-31' }),
        '2026-02-01',
      ),
    ).toMatchObject({ startAt: '2026-02-01', finishAt: '2026-02-28' })

    // Skips ahead to the first window that is still running today
    expect(
      getRepeatedGoal(
        pageGoal({ startAt: '2026-06-01', finishAt: '2026-06-30' }),
        '2026-08-15',
      ),
    ).toMatchObject({ startAt: '2026-08-01', finishAt: '2026-08-31' })

    // Quarters stay quarters
    expect(
      getRepeatedGoal(
        pageGoal({ startAt: '2026-01-01', finishAt: '2026-03-31' }),
        '2026-04-01',
      ),
    ).toMatchObject({ startAt: '2026-04-01', finishAt: '2026-06-30' })
  })

  it('keeps stored ISO dates on the same calendar day in every time zone', () => {
    const repeated = getRepeatedGoal(
      bookGoal({ title: 'Read 24 books in 2026' }),
      '2027-01-05',
    )
    expect(toSimpleDate(repeated.startAt)).toBe('2027-01-01')
    expect(toSimpleDate(repeated.finishAt)).toBe('2027-12-31')
  })
})

describe('getGoalRangePreset', () => {
  it('returns calendar ranges relative to today', () => {
    expect(getGoalRangePreset('currentYear', '2026-10-29')).toEqual([
      '2026-01-01',
      '2026-12-31',
    ])
    expect(getGoalRangePreset('nextMonth', '2026-10-29')).toEqual([
      '2026-11-01',
      '2026-11-30',
    ])
    expect(getGoalRangePreset('halfYear', '2026-10-29')).toEqual([
      '2026-10-29',
      '2027-04-28',
    ])
  })

  it('uses Monday–Sunday weeks', () => {
    // 2026-10-29 is a Thursday, 2026-11-01 a Sunday, 2026-11-02 a Monday
    expect(getGoalRangePreset('week', '2026-10-29')).toEqual([
      '2026-10-26',
      '2026-11-01',
    ])
    expect(getGoalRangePreset('week', '2026-11-01')).toEqual([
      '2026-10-26',
      '2026-11-01',
    ])
    expect(getGoalRangePreset('week', '2026-11-02')).toEqual([
      '2026-11-02',
      '2026-11-08',
    ])
  })
})

describe('periodic goal status', () => {
  const daily = (values: number[]) =>
    pageGoal({
      startAt: '2026-10-01',
      finishAt: `2026-10-0${values.length}`,
      entries: values.map((pages, index) => ({
        id: `e${index}`,
        pages,
        createdAt: `2026-10-0${index + 1}T00:00:00.000Z`,
      })),
    } as Partial<Goal>)

  it('is not completed when only the all-time total reaches the amount', () => {
    // 3 days of "30 pages a day", target met once
    expect(getGoalStatus(daily([30, 0, 0]), '2026-11-01')).toBe('expired')
    expect(getGoalStatus(daily([90, 0, 0]), '2026-11-01')).toBe('expired')
  })

  it('is completed when every period met the target', () => {
    expect(getGoalStatus(daily([30, 45, 31]), '2026-11-01')).toBe('completed')
  })

  it('still reports progress for running goals', () => {
    expect(getGoalStatus(daily([30, 0, 0]), '2026-10-02')).toBe('tracking')
  })
})

describe('getGoalPeriods (long goals)', () => {
  it('covers daily goals longer than 400 days', () => {
    const periods = getGoalPeriods(
      pageGoal({ startAt: '2026-01-01', finishAt: '2027-12-31' }),
    )
    expect(periods).toHaveLength(730)
    expect(periods.at(-1)).toMatchObject({
      start: '2027-12-31',
      end: '2027-12-31',
    })
  })
})

describe('getFeaturedGoal', () => {
  it('picks the longest active total book goal running today', () => {
    const year = bookGoal({ id: 'year' })
    const summer = bookGoal({
      id: 'summer',
      startAt: '2026-06-01',
      finishAt: '2026-08-31',
    })
    const pages = pageGoal({ id: 'pages', interval: 'total' })
    const paused = bookGoal({ id: 'paused', status: 'not-tracking' })

    expect(
      getFeaturedGoal([summer, pages, paused, year], '2026-07-01')?.id,
    ).toBe('year')
    expect(getFeaturedGoal([summer, pages], '2026-10-01')).toBeNull()
  })
})
