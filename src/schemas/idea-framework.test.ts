import { describe, it, expect } from 'vitest'
import {
  IDEA_FRAMEWORK_TYPES,
  IDEA_FRAMEWORK_NAMES,
  IDEA_FRAMEWORK_BASE_URLS,
  baseIdeaSchema,
  baseIdeaListItemSchema,
  type IdeaFrameworkType,
  type BaseIdeaFormData,
  type BaseIdeaListItem,
} from './idea-framework'

describe('idea-framework', () => {
  describe('IDEA_FRAMEWORK_TYPES', () => {
    it('BRAINWRITINGが定義されている', () => {
      expect(IDEA_FRAMEWORK_TYPES.BRAINWRITING).toBe('brainwriting')
    })

    it('MANDALARTが定義されている', () => {
      expect(IDEA_FRAMEWORK_TYPES.MANDALART).toBe('mandalart')
    })

    it('OSBORN_CHECKLISTが定義されている', () => {
      expect(IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST).toBe('osborn_checklist')
    })

    it('3種類のフレームワークが定義されている', () => {
      expect(Object.keys(IDEA_FRAMEWORK_TYPES)).toHaveLength(3)
    })
  })

  describe('IDEA_FRAMEWORK_NAMES', () => {
    it('ブレインライティングの表示名が正しい', () => {
      expect(IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.BRAINWRITING]).toBe('ブレインライティング')
    })

    it('マンダラートの表示名が正しい', () => {
      expect(IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.MANDALART]).toBe('マンダラート')
    })

    it('オズボーンのチェックリストの表示名が正しい', () => {
      expect(IDEA_FRAMEWORK_NAMES[IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST]).toBe('オズボーンのチェックリスト')
    })

    it('すべてのフレームワークタイプに表示名がある', () => {
      Object.values(IDEA_FRAMEWORK_TYPES).forEach((type) => {
        expect(IDEA_FRAMEWORK_NAMES[type]).toBeDefined()
        expect(typeof IDEA_FRAMEWORK_NAMES[type]).toBe('string')
      })
    })
  })

  describe('IDEA_FRAMEWORK_BASE_URLS', () => {
    it('ブレインライティングのURLが正しい', () => {
      expect(IDEA_FRAMEWORK_BASE_URLS[IDEA_FRAMEWORK_TYPES.BRAINWRITING]).toBe('/brainwritings')
    })

    it('マンダラートのURLが正しい', () => {
      expect(IDEA_FRAMEWORK_BASE_URLS[IDEA_FRAMEWORK_TYPES.MANDALART]).toBe('/mandalarts')
    })

    it('オズボーンのチェックリストのURLが正しい', () => {
      expect(IDEA_FRAMEWORK_BASE_URLS[IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST]).toBe('/osborn-checklists')
    })

    it('すべてのURLが/で始まる', () => {
      Object.values(IDEA_FRAMEWORK_BASE_URLS).forEach((url) => {
        expect(url.startsWith('/')).toBe(true)
      })
    })
  })

  describe('baseIdeaSchema', () => {
    it('有効なデータをパースできる', () => {
      const validData = {
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: 'テスト説明',
      }

      const result = baseIdeaSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('idはオプショナルである', () => {
      const withId = {
        id: 1,
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
      }

      const withoutId = {
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
      }

      expect(baseIdeaSchema.safeParse(withId).success).toBe(true)
      expect(baseIdeaSchema.safeParse(withoutId).success).toBe(true)
    })

    it('タイトルが空の場合はエラーになる', () => {
      const invalidData = {
        title: '',
        themeName: 'テストテーマ',
        description: null,
      }

      const result = baseIdeaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const titleError = result.error.issues.find(issue => issue.path.includes('title'))
        expect(titleError?.message).toBe('タイトルは必須です')
      }
    })

    it('タイトルが100文字を超える場合はエラーになる', () => {
      const invalidData = {
        title: 'あ'.repeat(101),
        themeName: 'テストテーマ',
        description: null,
      }

      const result = baseIdeaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const titleError = result.error.issues.find(issue => issue.path.includes('title'))
        expect(titleError?.message).toBe('タイトルは100文字以内で入力してください')
      }
    })

    it('テーマが空の場合はエラーになる', () => {
      const invalidData = {
        title: 'テストタイトル',
        themeName: '',
        description: null,
      }

      const result = baseIdeaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const themeError = result.error.issues.find(issue => issue.path.includes('themeName'))
        expect(themeError?.message).toBe('テーマは必須です')
      }
    })

    it('テーマが50文字を超える場合はエラーになる', () => {
      const invalidData = {
        title: 'テストタイトル',
        themeName: 'あ'.repeat(51),
        description: null,
      }

      const result = baseIdeaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const themeError = result.error.issues.find(issue => issue.path.includes('themeName'))
        expect(themeError?.message).toBe('テーマは50文字以内で入力してください')
      }
    })

    it('説明が500文字を超える場合はエラーになる', () => {
      const invalidData = {
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: 'あ'.repeat(501),
      }

      const result = baseIdeaSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const descError = result.error.issues.find(issue => issue.path.includes('description'))
        expect(descError?.message).toBe('説明は500文字以内で入力してください')
      }
    })

    it('説明はnullを許容する', () => {
      const validData = {
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
      }

      const result = baseIdeaSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('baseIdeaListItemSchema', () => {
    it('有効なデータをパースできる', () => {
      const validData = {
        id: 1,
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
        userId: 'user123',
        createdAt: new Date(),
      }

      const result = baseIdeaListItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('idが必須である', () => {
      const invalidData = {
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
        userId: 'user123',
        createdAt: new Date(),
      }

      const result = baseIdeaListItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('userIdが必須である', () => {
      const invalidData = {
        id: 1,
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
        createdAt: new Date(),
      }

      const result = baseIdeaListItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('createdAtが必須である', () => {
      const invalidData = {
        id: 1,
        title: 'テストタイトル',
        themeName: 'テストテーマ',
        description: null,
        userId: 'user123',
      }

      const result = baseIdeaListItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('型定義', () => {
    it('IdeaFrameworkTypeが正しい型を持つ', () => {
      const brainwriting: IdeaFrameworkType = 'brainwriting'
      const mandalart: IdeaFrameworkType = 'mandalart'
      const osborn: IdeaFrameworkType = 'osborn_checklist'

      expect(brainwriting).toBe('brainwriting')
      expect(mandalart).toBe('mandalart')
      expect(osborn).toBe('osborn_checklist')
    })

    it('BaseIdeaFormDataの型が正しい', () => {
      const formData: BaseIdeaFormData = {
        title: 'テスト',
        themeName: 'テーマ',
        description: null,
      }

      expect(formData.title).toBe('テスト')
      expect(formData.themeName).toBe('テーマ')
      expect(formData.description).toBe(null)
    })

    it('BaseIdeaListItemの型が正しい', () => {
      const listItem: BaseIdeaListItem = {
        id: 1,
        title: 'テスト',
        themeName: 'テーマ',
        description: null,
        userId: 'user123',
        createdAt: new Date(),
      }

      expect(listItem.id).toBe(1)
      expect(listItem.userId).toBe('user123')
      expect(listItem.createdAt).toBeInstanceOf(Date)
    })
  })
})
