import { describe, expect, it } from 'vitest'
import type { Goal } from '~/types/goal'
import {
  CHALLENGES,
  FEATURED_CHALLENGE_IDS,
  compareToPreset,
  formatChallengeDuration,
  getChallenge,
  getChallengeLevel,
  getChallengePace,
  getChallengeRange,
  getChallengeUnitLabel,
  isLiveChallenge,
  type ChallengeTarget,
} from './challenges'

function challengeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: '30-day streak',
    type: 'pages',
    interval: 'daily',
    amount: 20,
    createdAt: '2026-01-01T00:00:00.000Z',
    startAt: '2026-01-01T00:00:00.000Z',
    finishAt: '2099-01-30T23:59:59.999Z',
    completedAt: null,
    status: 'tracking',
    author: null,
    genres: [],
    entries: [],
    challenge: '30-day',
    level: 1,
    ...overrides,
  } as Goal
}

const target = (overrides: Partial<ChallengeTarget>): ChallengeTarget => ({
  type: 'books',
  interval: 'total',
  amount: 52,
  startAt: '2026-01-01',
  finishAt: '2026-12-31',
  ...overrides,
})

describe('challenge presets', () => {
  it('has unique ids and features one challenge per difficulty', () => {
    const ids = CHALLENGES.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
    const featured = FEATURED_CHALLENGE_IDS.map((id) => getChallenge(id)!)
    expect(featured.map(({ level }) => level).sort()).toEqual([1, 2, 3])
  })

  it('only auto-counts the 52 books challenge', () => {
    expect(CHALLENGES.filter((c) => c.auto).map((c) => c.id)).toEqual([
      '52-books',
    ])
  })

  it('formats durations', () => {
    expect(formatChallengeDuration(getChallenge('52-books')!)).toBe('1 year')
    expect(formatChallengeDuration(getChallenge('1000-pages')!)).toBe(
      '3 months',
    )
    expect(formatChallengeDuration(getChallenge('100-hours')!)).toBe('100 days')
  })

  it('labels the target unit', () => {
    expect(getChallengeUnitLabel(getChallenge('52-books')!)).toBe(
      'books in total',
    )
    expect(getChallengeUnitLabel(getChallenge('1000-pages')!)).toBe(
      'pages per month',
    )
  })
})

describe('getChallengeRange', () => {
  it('runs a year-long challenge from today', () => {
    expect(getChallengeRange(getChallenge('52-books')!, '2026-03-15')).toEqual([
      '2026-03-15',
      '2027-03-14',
    ])
  })

  it('counts day-based durations inclusively', () => {
    expect(getChallengeRange(getChallenge('30-day')!, '2026-03-15')).toEqual([
      '2026-03-15',
      '2026-04-13',
    ])
  })

  it('starts monthly challenges this month during its first week', () => {
    expect(
      getChallengeRange(getChallenge('1000-pages')!, '2026-03-07'),
    ).toEqual(['2026-03-01', '2026-05-31'])
  })

  it('starts monthly challenges next month after the first week', () => {
    expect(
      getChallengeRange(getChallenge('1000-pages')!, '2026-03-08'),
    ).toEqual(['2026-04-01', '2026-06-30'])
  })
})

describe('getChallengePace', () => {
  it('describes book goals as one book every N days', () => {
    expect(getChallengePace(target({}))).toBe('≈ 1 book every 7 days')
  })

  it('describes daily goals literally', () => {
    expect(
      getChallengePace(
        target({ type: 'pages', interval: 'daily', amount: 20 }),
      ),
    ).toBe('20 pages every day')
  })

  it('describes monthly page goals per day', () => {
    expect(
      getChallengePace(
        target({ type: 'pages', interval: 'monthly', amount: 1000 }),
      ),
    ).toBe('≈ 33 pages a day')
  })

  it('describes light hour goals in minutes', () => {
    expect(
      getChallengePace(
        target({
          type: 'hours',
          amount: 75,
          startAt: '2026-01-01',
          finishAt: '2026-04-10',
        }),
      ),
    ).toBe('≈ 45 minutes a day')
  })
})

describe('compareToPreset', () => {
  const preset = target({})

  it('matches when within 4% of the preset load', () => {
    expect(compareToPreset(target({ amount: 53 }), preset)).toBe('preset')
  })

  it('is tougher with a bigger target or a shorter window', () => {
    expect(compareToPreset(target({ amount: 60 }), preset)).toBe('tougher')
    expect(compareToPreset(target({ finishAt: '2026-10-31' }), preset)).toBe(
      'tougher',
    )
  })

  it('is easier with a smaller target', () => {
    expect(compareToPreset(target({ amount: 40 }), preset)).toBe('easier')
  })
})

describe('challenge goals', () => {
  it('is live while running or paused', () => {
    expect(isLiveChallenge(challengeGoal())).toBe(true)
    expect(isLiveChallenge(challengeGoal({ status: 'not-tracking' }))).toBe(
      true,
    )
  })

  it('is not live once over or when not a challenge', () => {
    expect(
      isLiveChallenge(challengeGoal({ finishAt: '2026-01-30T23:59:59.999Z' })),
    ).toBe(false)
    expect(isLiveChallenge(challengeGoal({ challenge: undefined }))).toBe(false)
  })

  it('falls back to the preset level', () => {
    expect(getChallengeLevel(challengeGoal({ level: undefined }))).toBe(1)
    expect(
      getChallengeLevel(
        challengeGoal({ challenge: 'unknown', level: undefined }),
      ),
    ).toBe(2)
  })
})
