import { describe, it, expect } from 'vitest'
import { userFormDataSchema } from './user'

describe('User Schema', () => {
  describe('userFormDataSchema', () => {
    describe('name', () => {
      it('正しい名前を受け入れる', () => {
        const validData = {
          name: 'テストユーザー',
        }

        const result = userFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('空の名前を拒否する', () => {
        const invalidData = {
          name: '',
        }

        const result = userFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('名前は必須です')
        }
      })

      it('100文字を超える名前を拒否する', () => {
        const invalidData = {
          name: 'あ'.repeat(101),
        }

        const result = userFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('名前は100文字以内で入力してください')
        }
      })

      it('100文字の名前を受け入れる', () => {
        const validData = {
          name: 'あ'.repeat(100),
        }

        const result = userFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('1文字の名前を受け入れる', () => {
        const validData = {
          name: 'あ',
        }

        const result = userFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })
})
