import { describe, it, expect } from 'vitest'
import { brainwritingFormDataSchema } from './brainwriting'
import { USAGE_SCOPE } from '@/utils/brainwriting'

describe('brainwritingFormDataSchema', () => {
  describe('baseIdeaSchema 継承の検証', () => {
    it('正常なブレインライティングデータを受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(true)
    })

    it('空文字のタイトルを拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: '',
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タイトルは必須です')
      }
    })

    it('101文字以上のタイトルを拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'a'.repeat(101),
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('タイトルは100文字以内で入力してください')
      }
    })
  })

  describe('usageScope バリデーション', () => {
    it('XPOST usageScope を受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.usageScope).toBe('xpost')
      }
    })

    it('TEAM usageScope を受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.TEAM,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.usageScope).toBe('team')
      }
    })

    it('無効な usageScope を拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
        usageScope: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('usageScope が未指定の場合は失敗する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('利用方法を選択してください')
      }
    })
  })

  describe('themeName バリデーション', () => {
    it('空文字のテーマ名を拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: '',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('テーマは必須です')
      }
    })

    it('51文字以上のテーマ名を拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'a'.repeat(51),
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('テーマは50文字以内で入力してください')
      }
    })

    it('50文字のテーマ名を受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'a'.repeat(50),
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('description バリデーション', () => {
    it('null の説明を受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: null,
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(true)
    })

    it('501文字以上の説明を拒否する', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: 'a'.repeat(501),
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('説明は500文字以内で入力してください')
      }
    })

    it('500文字の説明を受け入れる', () => {
      const result = brainwritingFormDataSchema.safeParse({
        title: 'テストブレインライティング',
        themeName: 'テストテーマ',
        description: 'a'.repeat(500),
        usageScope: USAGE_SCOPE.XPOST,
      })
      expect(result.success).toBe(true)
    })
  })
})
