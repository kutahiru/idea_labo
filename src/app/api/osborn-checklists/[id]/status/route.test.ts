import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// モック用のグローバル変数（vi.hoistedで宣言）
const { mockDb, mockValidateIdRequest } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(),
  },
  mockValidateIdRequest: vi.fn(),
}))

// データベースをモック
vi.mock('@/db', () => ({
  db: mockDb,
}))

// スキーマをモック
vi.mock('@/db/schema', () => ({
  ai_generations: { target_type: 'target_type', target_id: 'target_id' },
  osborn_checklist_inputs: { osborn_checklist_id: 'osborn_checklist_id' },
}))

// drizzle-ormをモック
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => ({ conditions })),
}))

// API utilsをモック
vi.mock('@/lib/api/utils', () => ({
  validateIdRequest: mockValidateIdRequest,
  apiErrors: {
    serverError: () => new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }),
  },
}))

// osborn-checklistスキーマをモック
vi.mock('@/schemas/osborn-checklist', () => ({
  OSBORN_CHECKLIST_TYPES: {
    TRANSFER: 'transfer',
    APPLY: 'apply',
    MODIFY: 'modify',
    MAGNIFY: 'magnify',
    MINIFY: 'minify',
    SUBSTITUTE: 'substitute',
    REARRANGE: 'rearrange',
    REVERSE: 'reverse',
    COMBINE: 'combine',
  },
}))

import { GET } from './route'

describe('GET /api/osborn-checklists/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = () => {
    return new NextRequest('http://localhost:3000/api/osborn-checklists/1/status')
  }

  const createMockParams = (id: string) => {
    return Promise.resolve({ id })
  }

  it('AI生成ステータスと入力数を正常に取得する', async () => {
    const mockGeneration = {
      id: 1,
      target_type: 'osborn_checklist',
      target_id: 1,
      generation_status: 'completed',
      created_at: new Date(),
      updated_at: new Date(),
    }

    const mockInputs = [
      { id: 1, osborn_checklist_id: 1, type: 'transfer', content: 'アイデア1' },
      { id: 2, osborn_checklist_id: 1, type: 'apply', content: 'アイデア2' },
      { id: 3, osborn_checklist_id: 1, type: 'modify', content: '' },
    ]

    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    // AI生成ステータス取得のモック
    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGeneration]),
        }),
      }),
    }

    // 入力データ取得のモック
    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockInputs),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.generation.id).toBe(mockGeneration.id)
    expect(data.generation.target_type).toBe(mockGeneration.target_type)
    expect(data.generation.target_id).toBe(mockGeneration.target_id)
    expect(data.generation.generation_status).toBe(mockGeneration.generation_status)
    expect(data.inputsCount.filled).toBe(2) // 空でないcontentが2つ
    expect(data.inputsCount.total).toBe(9) // OSBORN_CHECKLIST_TYPESの数
  })

  it('AI生成が未実行の場合はgenerationがnullを返す', async () => {
    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }

    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.generation).toBe(null)
    expect(data.inputsCount.filled).toBe(0)
    expect(data.inputsCount.total).toBe(9)
  })

  it('全ての入力が埋まっている場合は9/9を返す', async () => {
    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    const mockInputs = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      osborn_checklist_id: 1,
      type: 'type' + i,
      content: 'アイデア' + (i + 1),
    }))

    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 1, generation_status: 'completed' }]),
        }),
      }),
    }

    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockInputs),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(data.inputsCount.filled).toBe(9)
    expect(data.inputsCount.total).toBe(9)
  })

  it('空白のみのcontentはカウントしない', async () => {
    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    const mockInputs = [
      { id: 1, content: 'アイデア1' },
      { id: 2, content: '   ' }, // 空白のみ
      { id: 3, content: '' }, // 空文字
      { id: 4, content: null }, // null
    ]

    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }

    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockInputs),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(data.inputsCount.filled).toBe(1) // 有効なcontentは1つだけ
  })

  it('IDバリデーションエラー時はエラーレスポンスを返す', async () => {
    const errorResponse = new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 })
    mockValidateIdRequest.mockResolvedValueOnce({ error: errorResponse })

    const response = await GET(createMockRequest(), { params: createMockParams('invalid') }) as Response

    expect(response.status).toBe(400)
  })

  it('データベースエラー時は500エラーを返す', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    })

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as Response

    expect(response.status).toBe(500)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('processing状態のAI生成を正しく返す', async () => {
    const mockGeneration = {
      id: 1,
      target_type: 'osborn_checklist',
      target_id: 1,
      generation_status: 'processing',
      created_at: new Date(),
      updated_at: new Date(),
    }

    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGeneration]),
        }),
      }),
    }

    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(data.generation.generation_status).toBe('processing')
  })

  it('failed状態のAI生成を正しく返す', async () => {
    const mockGeneration = {
      id: 1,
      target_type: 'osborn_checklist',
      target_id: 1,
      generation_status: 'failed',
      error_message: 'AIエラー',
      created_at: new Date(),
      updated_at: new Date(),
    }

    mockValidateIdRequest.mockResolvedValueOnce({ id: 1 })

    const mockGenerationChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockGeneration]),
        }),
      }),
    }

    const mockInputsChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }

    mockDb.select
      .mockReturnValueOnce(mockGenerationChain)
      .mockReturnValueOnce(mockInputsChain)

    const response = await GET(createMockRequest(), { params: createMockParams('1') }) as NextResponse
    const data = await response.json()

    expect(data.generation.generation_status).toBe('failed')
    expect(data.generation.error_message).toBe('AIエラー')
  })
})
