import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// モック用のグローバル変数（vi.hoistedで宣言）
const {
  mockCreate,
  mockSelect,
  mockUpdate,
  mockInsert,
  mockGetMandalartById,
  mockUpdateMandalartAIGenerationStatus,
  mockUpdateMandalartAIGenerationResult,
  mockPublishMandalartEvent,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockSelect: vi.fn(),
  mockUpdate: vi.fn(),
  mockInsert: vi.fn(),
  mockGetMandalartById: vi.fn(),
  mockUpdateMandalartAIGenerationStatus: vi.fn(),
  mockUpdateMandalartAIGenerationResult: vi.fn(),
  mockPublishMandalartEvent: vi.fn(),
}))

// OpenAI をモック
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}))

// データベース関連をモック
vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: mockSelect,
      }),
    }),
    update: () => ({
      set: () => ({
        where: mockUpdate,
      }),
    }),
    insert: () => ({
      values: mockInsert,
    }),
  },
}))

vi.mock('@/db/schema', () => ({
  mandalart_inputs: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}))

// mandalart をモック
vi.mock('./mandalart', () => ({
  getMandalartById: mockGetMandalartById,
  updateMandalartAIGenerationStatus: mockUpdateMandalartAIGenerationStatus,
  updateMandalartAIGenerationResult: mockUpdateMandalartAIGenerationResult,
}))

// AppSync イベントをモック
vi.mock('./appsync-events/mandalart-events', () => ({
  publishMandalartEvent: mockPublishMandalartEvent,
}))

vi.mock('./appsync-events/event-types', () => ({
  MANDALART_EVENT_TYPES: {
    AI_GENERATION_COMPLETED: 'AI_GENERATION_COMPLETED',
    AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  },
}))

import { generateMandalartIdeas } from './mandalart-ai-worker'

describe('mandalart-ai-worker', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-api-key',
      OPENAI_MODEL: 'gpt-4',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const mockMandalart = {
    id: 1,
    title: 'テストマンダラート',
    themeName: '目標達成',
    description: '1年間の目標を達成するためのマンダラート',
    userId: 'user123',
  }

  const mockValidAIResponse = {
    isValid: true,
    reason: 'テーマは適切です',
    subThemes: [
      'サブテーマ1',
      'サブテーマ2',
      'サブテーマ3',
      'サブテーマ4',
      'サブテーマ5',
      'サブテーマ6',
      'サブテーマ7',
      'サブテーマ8',
    ],
    ideas: {
      '0': ['アイデア1-1', 'アイデア1-2', 'アイデア1-3', 'アイデア1-4', 'アイデア1-5', 'アイデア1-6', 'アイデア1-7', 'アイデア1-8'],
      '1': ['アイデア2-1', 'アイデア2-2', 'アイデア2-3', 'アイデア2-4', 'アイデア2-5', 'アイデア2-6', 'アイデア2-7', 'アイデア2-8'],
      '2': ['アイデア3-1', 'アイデア3-2', 'アイデア3-3', 'アイデア3-4', 'アイデア3-5', 'アイデア3-6', 'アイデア3-7', 'アイデア3-8'],
      '3': ['アイデア4-1', 'アイデア4-2', 'アイデア4-3', 'アイデア4-4', 'アイデア4-5', 'アイデア4-6', 'アイデア4-7', 'アイデア4-8'],
      '4': ['アイデア5-1', 'アイデア5-2', 'アイデア5-3', 'アイデア5-4', 'アイデア5-5', 'アイデア5-6', 'アイデア5-7', 'アイデア5-8'],
      '5': ['アイデア6-1', 'アイデア6-2', 'アイデア6-3', 'アイデア6-4', 'アイデア6-5', 'アイデア6-6', 'アイデア6-7', 'アイデア6-8'],
      '6': ['アイデア7-1', 'アイデア7-2', 'アイデア7-3', 'アイデア7-4', 'アイデア7-5', 'アイデア7-6', 'アイデア7-7', 'アイデア7-8'],
      '7': ['アイデア8-1', 'アイデア8-2', 'アイデア8-3', 'アイデア8-4', 'アイデア8-5', 'アイデア8-6', 'アイデア8-7', 'アイデア8-8'],
    },
  }

  describe('generateMandalartIdeas', () => {
    it('正常にアイデアを生成し保存する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockValidAIResponse),
            },
          },
        ],
      })
      mockSelect.mockResolvedValue([]) // 既存データなし
      mockInsert.mockResolvedValue(undefined)
      mockUpdateMandalartAIGenerationResult.mockResolvedValue(undefined)
      mockPublishMandalartEvent.mockResolvedValue(undefined)

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      // ステータスが「処理中」に更新される
      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(1, 'processing')

      // マンダラートが取得される
      expect(mockGetMandalartById).toHaveBeenCalledWith(1, 'user123')

      // OpenAI APIが呼ばれる
      expect(mockCreate).toHaveBeenCalled()

      // 結果が保存される
      expect(mockUpdateMandalartAIGenerationResult).toHaveBeenCalledWith(
        1,
        JSON.stringify({
          subThemes: mockValidAIResponse.subThemes,
          ideas: mockValidAIResponse.ideas,
        })
      )

      // 完了イベントが発行される
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_COMPLETED'
      )
    })

    it('マンダラートが見つからない場合は失敗ステータスを更新する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(null)

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(1, 'failed', 'マンダラートが見つかりません')
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
    })

    it('テーマが不適切な場合は失敗ステータスを更新する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: false,
                reason: '無意味な文字列です',
                subThemes: [],
                ideas: {},
              }),
            },
          },
        ],
      })

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'テーマが適切ではありません'
      )
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED',
        'テーマが適切ではありません'
      )
    })

    it('AI応答が空の場合は失敗ステータスを更新する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      })

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(1, 'failed', 'AI応答が空です')
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
    })

    it('サブテーマが8つでない場合は失敗ステータスを更新する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: true,
                reason: 'テーマは適切です',
                subThemes: ['サブテーマ1', 'サブテーマ2'], // 8つ未満
                ideas: mockValidAIResponse.ideas,
              }),
            },
          },
        ],
      })

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
    })

    it('アイデアが不足している場合は失敗ステータスを更新する', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: true,
                reason: 'テーマは適切です',
                subThemes: mockValidAIResponse.subThemes,
                ideas: {
                  '0': ['アイデア1-1', 'アイデア1-2'], // 8つ未満
                },
              }),
            },
          },
        ],
      })

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
    })

    it('既存の入力が空でない場合はスキップする', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockValidAIResponse),
            },
          },
        ],
      })
      // 既存データあり（空でない内容）
      mockSelect.mockResolvedValue([{ 
        id: 1, 
        content: '既存の内容',
        section_row_index: 1,
        section_column_index: 1,
        row_index: 0,
        column_index: 0,
      }])
      mockUpdateMandalartAIGenerationResult.mockResolvedValue(undefined)
      mockPublishMandalartEvent.mockResolvedValue(undefined)

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      // 完了イベントが発行される（既存データがあっても処理は成功する）
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_COMPLETED'
      )
    })

    it('OpenAI APIエラー時は失敗ステータスを更新する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockRejectedValueOnce(new Error('OpenAI API Error'))

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'OpenAI API Error'
      )
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )

      consoleSpy.mockRestore()
    })

    it('説明がnullの場合は「なし」として処理される', async () => {
      const mandalartWithoutDescription = {
        ...mockMandalart,
        description: null,
      }
      mockGetMandalartById.mockResolvedValueOnce(mandalartWithoutDescription)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockValidAIResponse),
            },
          },
        ],
      })
      mockSelect.mockResolvedValue([])
      mockInsert.mockResolvedValue(undefined)
      mockUpdateMandalartAIGenerationResult.mockResolvedValue(undefined)
      mockPublishMandalartEvent.mockResolvedValue(undefined)

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      // エラーなく処理が完了する
      expect(mockPublishMandalartEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_COMPLETED'
      )
    })

    it('セクション0-7のアイデアが全て8つずつ必要', async () => {
      mockGetMandalartById.mockResolvedValueOnce(mockMandalart)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: true,
                reason: 'テーマは適切です',
                subThemes: mockValidAIResponse.subThemes,
                ideas: {
                  '0': ['アイデア1-1', 'アイデア1-2', 'アイデア1-3', 'アイデア1-4', 'アイデア1-5', 'アイデア1-6', 'アイデア1-7', 'アイデア1-8'],
                  '1': ['アイデア2-1', 'アイデア2-2', 'アイデア2-3', 'アイデア2-4', 'アイデア2-5', 'アイデア2-6', 'アイデア2-7', 'アイデア2-8'],
                  '2': ['アイデア3-1', 'アイデア3-2', 'アイデア3-3', 'アイデア3-4', 'アイデア3-5', 'アイデア3-6', 'アイデア3-7', 'アイデア3-8'],
                  '3': ['アイデア4-1', 'アイデア4-2', 'アイデア4-3', 'アイデア4-4', 'アイデア4-5', 'アイデア4-6', 'アイデア4-7', 'アイデア4-8'],
                  '4': ['アイデア5-1', 'アイデア5-2', 'アイデア5-3', 'アイデア5-4', 'アイデア5-5', 'アイデア5-6', 'アイデア5-7', 'アイデア5-8'],
                  '5': ['アイデア6-1', 'アイデア6-2', 'アイデア6-3', 'アイデア6-4', 'アイデア6-5', 'アイデア6-6', 'アイデア6-7', 'アイデア6-8'],
                  '6': ['アイデア7-1', 'アイデア7-2', 'アイデア7-3', 'アイデア7-4', 'アイデア7-5', 'アイデア7-6', 'アイデア7-7', 'アイデア7-8'],
                  // '7' が欠けている
                },
              }),
            },
          },
        ],
      })

      await generateMandalartIdeas({
        generationId: 1,
        mandalartId: 1,
        userId: 'user123',
      })

      expect(mockUpdateMandalartAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'AIでのアイデア生成に失敗しました。再度お試しください。'
      )
    })
  })
})
