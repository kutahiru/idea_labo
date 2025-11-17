import { describe, it, expect } from 'vitest'
import { ideaFormDataSchema } from './idea'

describe('ideaFormDataSchema', () => {
  describe('name バリデーション', () => {
    it('正常なアイデア名を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(true)
    })

    it('空文字のアイデア名を拒否する', () => {
      const result = ideaFormDataSchema.safeParse({
        name: '',
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('アイデア名は必須です')
      }
    })

    it('101文字以上のアイデア名を拒否する', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'a'.repeat(101),
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('アイデア名は100文字以内で入力してください')
      }
    })

    it('100文字のアイデア名を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'a'.repeat(100),
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('description バリデーション', () => {
    it('null の説明を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(true)
    })

    it('1001文字以上の説明を拒否する', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: 'a'.repeat(1001),
        priority: 'medium',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('説明は500文字以内で入力してください')
      }
    })

    it('1000文字の説明を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: 'a'.repeat(1000),
        priority: 'medium',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('priority バリデーション', () => {
    it('high 優先度を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'high',
      })
      expect(result.success).toBe(true)
    })

    it('medium 優先度を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'medium',
      })
      expect(result.success).toBe(true)
    })

    it('low 優先度を受け入れる', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'low',
      })
      expect(result.success).toBe(true)
    })

    it('無効な優先度を拒否する', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
        priority: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('優先度が未指定の場合 medium をデフォルト値とする', () => {
      const result = ideaFormDataSchema.safeParse({
        name: 'テストアイデア',
        description: null,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.priority).toBe('medium')
      }
    })
  })
})
