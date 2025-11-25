import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// モック用のグローバル変数（vi.hoistedで宣言）
const {
  mockCreate,
  mockSelect,
  mockUpdate,
  mockInsert,
  mockGetOsbornChecklistById,
  mockUpdateAIGenerationStatus,
  mockUpdateAIGenerationResult,
  mockPublishOsbornChecklistEvent,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockSelect: vi.fn(),
  mockUpdate: vi.fn(),
  mockInsert: vi.fn(),
  mockGetOsbornChecklistById: vi.fn(),
  mockUpdateAIGenerationStatus: vi.fn(),
  mockUpdateAIGenerationResult: vi.fn(),
  mockPublishOsbornChecklistEvent: vi.fn(),
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
        where: () => ({
          limit: mockSelect,
        }),
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
  osborn_checklist_inputs: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}))

// osborn-checklist をモック
vi.mock('./osborn-checklist', () => ({
  getOsbornChecklistById: mockGetOsbornChecklistById,
  updateAIGenerationStatus: mockUpdateAIGenerationStatus,
  updateAIGenerationResult: mockUpdateAIGenerationResult,
}))

// AppSync イベントをモック
vi.mock('./appsync-events/osborn-checklist-events', () => ({
  publishOsbornChecklistEvent: mockPublishOsbornChecklistEvent,
}))

vi.mock('./appsync-events/event-types', () => ({
  OSBORN_CHECKLIST_EVENT_TYPES: {
    AI_GENERATION_COMPLETED: 'AI_GENERATION_COMPLETED',
    AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  },
}))

import { generateOsbornIdeas } from './osborn-ai-worker'

describe('osborn-ai-worker', () => {
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

  const mockOsbornChecklist = {
    id: 1,
    title: 'テストチェックリスト',
    themeName: 'スマートフォン',
    description: '新しいスマートフォンのアイデア',
    userId: 'user123',
  }

  const mockValidAIResponse = {
    isValid: true,
    reason: 'テーマは適切です',
    ideas: {
      transfer: '転用のアイデア',
      apply: '応用のアイデア',
      modify: '変更のアイデア',
      magnify: '拡大のアイデア',
      minify: '縮小のアイデア',
      substitute: '代用のアイデア',
      rearrange: '再配置のアイデア',
      reverse: '逆転のアイデア',
      combine: '結合のアイデア',
    },
  }

  describe('generateOsbornIdeas', () => {
    it('正常にアイデアを生成し保存する', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
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
      mockUpdateAIGenerationResult.mockResolvedValue(undefined)
      mockPublishOsbornChecklistEvent.mockResolvedValue(undefined)

      await generateOsbornIdeas({
        generationId: 1,
        osbornChecklistId: 1,
        userId: 'user123',
      })

      // ステータスが「処理中」に更新される
      expect(mockUpdateAIGenerationStatus).toHaveBeenCalledWith(1, 'processing')

      // チェックリストが取得される
      expect(mockGetOsbornChecklistById).toHaveBeenCalledWith(1, 'user123')

      // OpenAI APIが呼ばれる
      expect(mockCreate).toHaveBeenCalled()

      // 結果が保存される
      expect(mockUpdateAIGenerationResult).toHaveBeenCalledWith(
        1,
        JSON.stringify(mockValidAIResponse.ideas)
      )

      // 完了イベントが発行される
      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_COMPLETED'
      )
    })

    it('チェックリストが見つからない場合はエラーをスローする', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(null)

      await expect(
        generateOsbornIdeas({
          generationId: 1,
          osbornChecklistId: 1,
          userId: 'user123',
        })
      ).rejects.toThrow('オズボーンのチェックリストが見つかりません')

      expect(mockUpdateAIGenerationStatus).toHaveBeenCalledWith(1, 'failed', expect.any(String))
      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED'
      )
    })

    it('テーマが不適切な場合はエラーをスローする', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: false,
                reason: '無意味な文字列です',
                ideas: {},
              }),
            },
          },
        ],
      })

      await expect(
        generateOsbornIdeas({
          generationId: 1,
          osbornChecklistId: 1,
          userId: 'user123',
        })
      ).rejects.toThrow('テーマが適切ではありません: 無意味な文字列です')

      expect(mockUpdateAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'テーマが適切ではありません: 無意味な文字列です'
      )
      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED'
      )
    })

    it('AI応答が空の場合はエラーをスローする', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      })

      await expect(
        generateOsbornIdeas({
          generationId: 1,
          osbornChecklistId: 1,
          userId: 'user123',
        })
      ).rejects.toThrow('AI応答が空です')
    })

    it('必要なキーが不足している場合はエラーをスローする', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isValid: true,
                reason: 'テーマは適切です',
                ideas: {
                  transfer: '転用のアイデア',
                  // 他のキーが不足
                },
              }),
            },
          },
        ],
      })

      await expect(
        generateOsbornIdeas({
          generationId: 1,
          osbornChecklistId: 1,
          userId: 'user123',
        })
      ).rejects.toThrow('AI応答に必要なキーが不足しています')

      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED'
      )
    })

    it('既存の入力が空でない場合はスキップする', async () => {
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
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
      mockSelect.mockResolvedValue([{ id: 1, content: '既存の内容' }])
      mockUpdateAIGenerationResult.mockResolvedValue(undefined)
      mockPublishOsbornChecklistEvent.mockResolvedValue(undefined)

      await generateOsbornIdeas({
        generationId: 1,
        osbornChecklistId: 1,
        userId: 'user123',
      })

      // 更新・挿入が呼ばれない（スキップされる）
      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('OpenAI APIエラー時は失敗ステータスを更新する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGetOsbornChecklistById.mockResolvedValueOnce(mockOsbornChecklist)
      mockCreate.mockRejectedValueOnce(new Error('OpenAI API Error'))

      await expect(
        generateOsbornIdeas({
          generationId: 1,
          osbornChecklistId: 1,
          userId: 'user123',
        })
      ).rejects.toThrow('OpenAI API Error')

      expect(mockUpdateAIGenerationStatus).toHaveBeenCalledWith(
        1,
        'failed',
        'OpenAI API Error'
      )
      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_FAILED'
      )

      consoleSpy.mockRestore()
    })

    it('説明がnullの場合は「なし」として処理される', async () => {
      const checklistWithoutDescription = {
        ...mockOsbornChecklist,
        description: null,
      }
      mockGetOsbornChecklistById.mockResolvedValueOnce(checklistWithoutDescription)
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
      mockUpdateAIGenerationResult.mockResolvedValue(undefined)
      mockPublishOsbornChecklistEvent.mockResolvedValue(undefined)

      await generateOsbornIdeas({
        generationId: 1,
        osbornChecklistId: 1,
        userId: 'user123',
      })

      // エラーなく処理が完了する
      expect(mockPublishOsbornChecklistEvent).toHaveBeenCalledWith(
        1,
        'AI_GENERATION_COMPLETED'
      )
    })
  })
})
