import { toISOString, getIntervalUnit } from './date'

describe('date', () => {
  describe('toISOString', () => {
    it('should format date to ISO string', () => {
      const date = '2020-10-01T12:00:00.000Z'
      const isoString = toISOString(date)

      expect(isoString).toBe('2020-10-01T12:00:00.000Z')
    })

    it('should format date to ISO string when different timezone', () => {
      const date = '2020-10-01T12:00:00.000+03:00'
      const isoString = toISOString(date)

      expect(isoString).toBe('2020-10-01T09:00:00.000Z')
    })
  })

  describe('toSimpleDate', () => {
    it('should format date to simple date', () => {
      const date = '2020-10-01T12:00:00.000Z'
      const simpleDate = toSimpleDate(date)

      expect(simpleDate).toBe('2020-10-01')
    })
  })

  describe('toDefaultDate', () => {
    it('should format date to default date', () => {
      const date = '2020-10-01T12:00:00.000Z'
      const defaultDate = toDefaultDate(date)

      expect(defaultDate).toBe('10/01/2020')
    })
  })

  describe('toFullDate', () => {
    it('should format date to full date', () => {
      const date = '2020-10-01T12:00:00.000Z'
      const fullDate = toFullDate(date)

      expect(fullDate).toBe('October 1, 2020')
    })
  })

  describe('toFullDateCompact', () => {
    it('should format date to full date compact', () => {
      const date = '2020-10-01T12:00:00.000Z'
      const fullDateCompact = toFullDateCompact(date)

      expect(fullDateCompact).toBe('Oct 1, 2020')
    })
  })

  describe('getDateRange', () => {
    it('should return start and end of the day', () => {
      const date = '2020-10-01T12:00:00Z'
      const range = 'day'
      const { start, end } = getDateRange(date, range)

      expect({ start, end }).toEqual({
        start: '2020-10-01T00:00:00.000Z',
        end: '2020-10-01T23:59:59.999Z',
      })
    })

    it('should return start and end of the month', () => {
      const date = '2020-10-06T12:00:00Z'
      const range = 'month'
      const { start, end } = getDateRange(date, range)

      expect({ start, end }).toEqual({
        start: '2020-10-01T00:00:00.000Z',
        end: '2020-10-31T23:59:59.999Z',
      })
    })

    it('should return start and end of the year', () => {
      const date = '2020-10-21T12:00:00Z'
      const range = 'year'
      const { start, end } = getDateRange(date, range)

      expect({ start, end }).toEqual({
        start: '2020-01-01T00:00:00.000Z',
        end: '2020-12-31T23:59:59.999Z',
      })
    })
  })

  describe('getSixMonthsRange', () => {
    it('should return start and end of six months range', () => {
      const date = '2020-10-27T12:00:00.000Z'
      const { start, end } = getSixMonthsRange(date)

      expect({ start, end }).toEqual({
        start: '2020-10-27T12:00:00.000Z',
        end: '2021-04-27T12:00:00.000Z',
      })
    })
  })

  describe('getElapsedTimePercentage', () => {
    it('should return 0% if current date is before start date', () => {
      const date = '2020-01-01T00:00:00Z'

      const start = '2020-02-01T00:00:00Z'
      const end = '2020-03-01T00:00:00Z'

      const percentage = getElapsedTimePercentage(date, { start, end })

      expect(percentage).toBe(0)
    })

    it('should return 100% if current date is after end date', () => {
      const date = '2020-04-01T00:00:00Z'

      const start = '2020-02-01T00:00:00Z'
      const end = '2020-03-01T00:00:00Z'

      const percentage = getElapsedTimePercentage(date, { start, end })

      expect(percentage).toBe(100)
    })

    it('should return correct percentage for current date within range (30%)', () => {
      const date = '2020-02-09T19:00:00Z'

      const start = '2020-02-01T00:00:00Z'
      const end = '2020-03-01T00:00:00Z'

      const percentage = getElapsedTimePercentage(date, { start, end })

      expect(percentage).toBeCloseTo(30)
    })

    it('should return correct percentage for current date within range (50%)', () => {
      const date = '2020-02-15T12:00:00Z'

      const start = '2020-02-01T00:00:00Z'
      const end = '2020-03-01T00:00:00Z'

      const percentage = getElapsedTimePercentage(date, { start, end })

      expect(percentage).toBeCloseTo(50)
    })
  })

  describe('getDatesInInterval', () => {
    it('should return dates in daily interval', () => {
      const interval = {
        start: '2020-10-01T00:00:00Z',
        end: '2020-10-03T00:00:00Z',
      }
      const unit = 'day'
      const dates = getDatesInInterval(interval, unit)

      expect(dates).toEqual([
        '2020-10-01T00:00:00.000Z',
        '2020-10-02T00:00:00.000Z',
        '2020-10-03T00:00:00.000Z',
      ])
    })

    it('should return dates in monthly interval', () => {
      const interval = {
        start: '2020-01-01T00:00:00Z',
        end: '2020-04-01T00:00:00Z',
      }
      const unit = 'month'
      const dates = getDatesInInterval(interval, unit)

      expect(dates).toEqual([
        '2020-01-01T00:00:00.000Z',
        '2020-02-01T00:00:00.000Z',
        '2020-03-01T00:00:00.000Z',
        '2020-04-01T00:00:00.000Z',
      ])
    })

    it('should return dates in yearly interval', () => {
      const interval = {
        start: '2020-01-01T00:00:00Z',
        end: '2022-01-01T00:00:00Z',
      }
      const unit = 'year'
      const dates = getDatesInInterval(interval, unit)

      expect(dates).toEqual([
        '2020-01-01T00:00:00.000Z',
        '2021-01-01T00:00:00.000Z',
        '2022-01-01T00:00:00.000Z',
      ])
    })

    it('should return empty array if start date is after end date', () => {
      const interval = {
        start: '2020-10-05T00:00:00Z',
        end: '2020-10-01T00:00:00Z',
      }
      const unit = 'day'
      const dates = getDatesInInterval(interval, unit)

      expect(dates).toEqual([])
    })

    it('should return empty array if start date is equal to end date', () => {
      const interval = {
        start: '2020-10-01T00:00:00Z',
        end: '2020-10-01T00:00:00Z',
      }
      const unit = 'day'
      const dates = getDatesInInterval(interval, unit)

      expect(dates).toEqual(['2020-10-01T00:00:00.000Z'])
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day dates', () => {
      const date1 = '2020-10-01T12:00:00Z'
      const date2 = '2020-10-01T00:00:00Z'

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different day dates', () => {
      const date1 = '2020-10-01T12:00:00Z'
      const date2 = '2020-10-02T00:00:00Z'

      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isBeforeDay', () => {
    it('should return true if first date is before second date', () => {
      const date1 = '2020-10-01T12:00:00Z'
      const date2 = '2020-10-02T00:00:00Z'

      expect(isBeforeDay(date1, date2)).toBe(true)
    })

    it('should return false if first date is after second date', () => {
      const date1 = '2020-10-02T12:00:00Z'
      const date2 = '2020-10-01T00:00:00Z'

      expect(isBeforeDay(date1, date2)).toBe(false)
    })

    it('should return false if both dates are the same', () => {
      const date1 = '2020-10-01T12:00:00Z'
      const date2 = '2020-10-01T00:00:00Z'

      expect(isBeforeDay(date1, date2)).toBe(false)
    })
  })

  describe('toStartOfDay', () => {
    it('should return start of the day for given date', () => {
      const date = '2020-10-01T12:00:00Z'
      const startOfDay = toStartOfDay(date)

      expect(startOfDay).toBe('2020-10-01T00:00:00.000Z')
    })
  })

  describe('getIntervalUnit', () => {
    it('should return month if start and end are in the same year', () => {
      const start = '2020-01-01T00:00:00Z'
      const end = '2020-12-31T23:59:59.999Z'

      expect(getIntervalUnit({ start, end })).toBe('month')
    })

    it('should return day if start and end are in the same month', () => {
      const start = '2020-01-01T00:00:00Z'
      const end = '2020-01-31T23:59:59.999Z'

      expect(getIntervalUnit({ start, end })).toBe('day')
    })

    it('should return month if start and end are in different years', () => {
      const start = '2020-01-01T00:00:00Z'
      const end = '2021-01-01T00:00:00Z'

      expect(getIntervalUnit({ start, end })).toBe('month')
    })
  })
})
