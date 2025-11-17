import { describe, it, expect } from 'vitest'
import { ideaCategoryFormDataSchema } from './idea-category'

describe('IdeaCategory Schema', () => {
  describe('ideaCategoryFormDataSchema', () => {
    describe('name', () => {
      it('正しい名前を受け入れる', () => {
        const validData = {
          name: 'テストカテゴリ',
          description: 'テスト説明',
        }

        const result = ideaCategoryFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('空の名前を拒否する', () => {
        const invalidData = {
          name: '',
          description: 'テスト説明',
        }

        const result = ideaCategoryFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('カテゴリ名は必須です')
        }
      })

      it('100文字を超える名前を拒否する', () => {
        const invalidData = {
          name: 'あ'.repeat(101),
          description: 'テスト説明',
        }

        const result = ideaCategoryFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('カテゴリ名は100文字以内で入力してください')
        }
      })

      it('100文字の名前を受け入れる', () => {
        const validData = {
          name: 'あ'.repeat(100),
          description: 'テスト説明',
        }

        const result = ideaCategoryFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    describe('description', () => {
      it('nullの説明を受け入れる', () => {
        const validData = {
          name: 'テストカテゴリ',
          description: null,
        }

        const result = ideaCategoryFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('空文字列の説明を受け入れる', () => {
        const validData = {
          name: 'テストカテゴリ',
          description: '',
        }

        const result = ideaCategoryFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('500文字を超える説明を拒否する', () => {
        const invalidData = {
          name: 'テストカテゴリ',
          description: 'あ'.repeat(501),
        }

        const result = ideaCategoryFormDataSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('説明は500文字以内で入力してください')
        }
      })

      it('500文字の説明を受け入れる', () => {
        const validData = {
          name: 'テストカテゴリ',
          description: 'あ'.repeat(500),
        }

        const result = ideaCategoryFormDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })
})
