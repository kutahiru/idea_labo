import { describe, it, expect } from 'vitest'
import { mandalartInputSchema } from './mandalart'

describe('Mandalart Schema', () => {
  describe('mandalartInputSchema', () => {
    it('正しい入力データを受け入れる', () => {
      const validData = {
        mandalartId: 1,
        sectionRowIndex: 1,
        sectionColumnIndex: 1,
        rowIndex: 1,
        columnIndex: 1,
        content: 'テスト入力',
      }

      const result = mandalartInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    describe('mandalartId', () => {
      it('正の整数を受け入れる', () => {
        const validData = {
          mandalartId: 100,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('0を拒否する', () => {
        const invalidData = {
          mandalartId: 0,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('負の数を拒否する', () => {
        const invalidData = {
          mandalartId: -1,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('sectionRowIndex', () => {
      it('0を受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 0,
          sectionColumnIndex: 1,
          rowIndex: 1,
          columnIndex: 1,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('2を受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 2,
          sectionColumnIndex: 1,
          rowIndex: 1,
          columnIndex: 1,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('-1を拒否する', () => {
        const invalidData = {
          mandalartId: 1,
          sectionRowIndex: -1,
          sectionColumnIndex: 1,
          rowIndex: 1,
          columnIndex: 1,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('3を拒否する', () => {
        const invalidData = {
          mandalartId: 1,
          sectionRowIndex: 3,
          sectionColumnIndex: 1,
          rowIndex: 1,
          columnIndex: 1,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('content', () => {
      it('空文字列を受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('30文字を受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: 'あ'.repeat(30),
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('31文字を拒否する', () => {
        const invalidData = {
          mandalartId: 1,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: 'あ'.repeat(31),
        }

        const result = mandalartInputSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('インデックスの組み合わせ', () => {
      it('すべて0の組み合わせを受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 0,
          sectionColumnIndex: 0,
          rowIndex: 0,
          columnIndex: 0,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('すべて2の組み合わせを受け入れる', () => {
        const validData = {
          mandalartId: 1,
          sectionRowIndex: 2,
          sectionColumnIndex: 2,
          rowIndex: 2,
          columnIndex: 2,
          content: '',
        }

        const result = mandalartInputSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })
})
