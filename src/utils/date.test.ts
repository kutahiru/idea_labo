import { describe, it, expect } from 'vitest'
import { formatDate } from './date'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('Date型を受け入れて日本語形式でフォーマットできる', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDate(date)
      
      // 日本語ロケールでの形式: YYYY/MM/DD HH:mm
      expect(result).toMatch(/2024\/01\/15/)
      expect(result).toMatch(/14:30/)
    })

    it('string型を受け入れて日本語形式でフォーマットできる', () => {
      const dateString = '2024-01-15T14:30:00'
      const result = formatDate(dateString)
      
      expect(result).toMatch(/2024\/01\/15/)
      expect(result).toMatch(/14:30/)
    })

    it('年月日時分が含まれる', () => {
      const date = new Date('2024-12-25T23:59:00')
      const result = formatDate(date)
      
      expect(result).toContain('2024')
      expect(result).toContain('12')
      expect(result).toContain('25')
      expect(result).toContain('23')
      expect(result).toContain('59')
    })

    it('異なる日付で異なる結果を返す', () => {
      const date1 = new Date('2024-01-01T10:00:00')
      const date2 = new Date('2024-12-31T20:00:00')
      
      const result1 = formatDate(date1)
      const result2 = formatDate(date2)
      
      expect(result1).not.toBe(result2)
    })
  })
})
