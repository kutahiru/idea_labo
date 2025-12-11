/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as osbornChecklistLib from './osborn-checklist'
import { OSBORN_CHECKLIST_TYPES } from '@/schemas/osborn-checklist'

// データベースをモック
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}))

// トークン生成関数をモック
vi.mock('./token', () => ({
  generateToken: vi.fn(() => 'mock-token-123'),
}))

import { db } from '@/db'

describe('OsbornChecklist Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOsbornChecklistsByUserId', () => {
    it('ユーザーIDに紐づくオズボーンのチェックリスト一覧を取得できる', async () => {
      const mockChecklists = [
        {
          id: 1,
          userId: 'user-123',
          title: 'チェックリスト1',
          themeName: 'テーマ1',
          description: '説明1',
          createdAt: new Date('2024-01-01'),
        },
      ]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockChecklists),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistsByUserId('user-123')

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockChecklists)
    })
  })

  describe('createOsbornChecklist', () => {
    it('新しいオズボーンのチェックリストを作成できる', async () => {
      const mockData = {
        title: '新しいチェックリスト',
        themeName: 'テストテーマ',
        description: 'テスト説明',
      }

      const mockResult = {
        id: 1,
        title: '新しいチェックリスト',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        createdAt: new Date(),
      }

      const mockTransaction = vi.fn(async (callback: any) => {
        return await callback({
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockResult]),
            }),
          }),
        })
      })

      vi.mocked(db.transaction).mockImplementation(mockTransaction)

      const result = await osbornChecklistLib.createOsbornChecklist('user-123', mockData)

      expect(db.transaction).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('updateOsbornChecklist', () => {
    it('オズボーンのチェックリストを更新できる', async () => {
      const mockUpdateData = {
        title: '更新されたチェックリスト',
        themeName: '更新されたテーマ',
        description: '更新された説明',
      }

      const mockResult = {
        id: 1,
        title: '更新されたチェックリスト',
        themeName: '更新されたテーマ',
        description: '更新された説明',
        createdAt: new Date(),
      }

      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.updateOsbornChecklist(1, 'user-123', mockUpdateData)

      expect(db.update).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('deleteOsbornChecklist', () => {
    it('オズボーンのチェックリストを削除できる', async () => {
      const mockResult = { id: 1 }

      const mockChain = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.delete).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.deleteOsbornChecklist(1, 'user-123')

      expect(db.delete).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('getOsbornChecklistById', () => {
    it('オズボーンのチェックリストの詳細を取得できる', async () => {
      const mockChecklist = {
        id: 1,
        userId: 'user-123',
        title: 'テストチェックリスト',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: false,
        createdAt: new Date(),
      }

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockChecklist]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistById(1, 'user-123')

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockChecklist)
    })
  })

  describe('getOsbornChecklistInputsByOsbornChecklistId', () => {
    it('オズボーンのチェックリストIDに紐づく入力データを取得できる', async () => {
      const mockInputs = [
        {
          id: 1,
          osborn_checklist_id: 1,
          checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
          content: 'テスト入力',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistInputsByOsbornChecklistId(1)

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockInputs)
    })
  })

  describe('getOsbornChecklistDetailById', () => {
    it('オズボーンのチェックリストの詳細情報を取得できる', async () => {
      const mockChecklist = {
        id: 1,
        userId: 'user-123',
        title: 'テストチェックリスト',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: false,
        createdAt: new Date(),
      }

      const mockInputs = [
        {
          id: 1,
          osborn_checklist_id: 1,
          checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
          content: 'テスト入力',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // getOsbornChecklistById のモック
      const mockChecklistChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockChecklist]),
      }

      // getOsbornChecklistInputsByOsbornChecklistId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      }

      // getAIGenerationByOsbornChecklistId のモック（AI生成なし）
      const mockAIGenerationChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockChecklistChain as any)
        .mockReturnValueOnce(mockInputsChain as any)
        .mockReturnValueOnce(mockAIGenerationChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistDetailById(1, 'user-123')

      expect(result).toEqual({
        ...mockChecklist,
        inputs: mockInputs,
        aiGeneration: null,
      })
    })

    it('チェックリストが存在しない場合、nullを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistDetailById(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getOsbornChecklistDetailByToken', () => {
    it('公開トークンでチェックリスト詳細を取得できる', async () => {
      const mockChecklist = {
        id: 1,
        userId: 'user-123',
        title: 'テストチェックリスト',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: true,
        createdAt: new Date(),
      }

      const mockInputs = [
        {
          id: 1,
          osborn_checklist_id: 1,
          checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
          content: 'テスト入力',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // getOsbornChecklistDetailByToken のチェックリスト取得モック
      const mockChecklistChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockChecklist]),
      }

      // getOsbornChecklistInputsByOsbornChecklistId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockChecklistChain as any)
        .mockReturnValueOnce(mockInputsChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistDetailByToken('mock-token-123')

      expect(result).toEqual({
        ...mockChecklist,
        inputs: mockInputs,
        aiGeneration: null,
      })
    })

    it('トークンが存在しないまたは非公開の場合、nullを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await osbornChecklistLib.getOsbornChecklistDetailByToken('invalid-token')

      expect(result).toBeNull()
    })
  })

  describe('upsertOsbornChecklistInput', () => {
    it('新規の入力データを作成できる', async () => {
      const mockChecklist = {
        id: 1,
        userId: 'user-123',
        title: 'テストチェックリスト',
      }

      const mockInput = {
        id: 1,
        osborn_checklist_id: 1,
        checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
        content: '新しい入力',
        created_at: new Date(),
        updated_at: new Date(),
      }

      // getOsbornChecklistById のモック
      const mockChecklistChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockChecklist]),
      }

      // 既存データ検索（存在しない）
      const mockExistingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      // 新規作成
      const mockInsertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockInput]),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockChecklistChain as any)
        .mockReturnValueOnce(mockExistingChain as any)

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

      const result = await osbornChecklistLib.upsertOsbornChecklistInput(1, 'user-123', OSBORN_CHECKLIST_TYPES.TRANSFER, '新しい入力')

      expect(db.insert).toHaveBeenCalled()
      expect(result).toEqual(mockInput)
    })

    it('既存の入力データを更新できる', async () => {
      const mockChecklist = {
        id: 1,
        userId: 'user-123',
        title: 'テストチェックリスト',
      }

      const mockExistingInput = {
        id: 1,
        osborn_checklist_id: 1,
        checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
        content: '古い入力',
      }

      const mockUpdatedInput = {
        ...mockExistingInput,
        content: '更新された入力',
        updated_at: new Date(),
      }

      // getOsbornChecklistById のモック
      const mockChecklistChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockChecklist]),
      }

      // 既存データ検索（存在する）
      const mockExistingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockExistingInput]),
      }

      // 更新
      const mockUpdateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUpdatedInput]),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockChecklistChain as any)
        .mockReturnValueOnce(mockExistingChain as any)

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any)

      const result = await osbornChecklistLib.upsertOsbornChecklistInput(1, 'user-123', OSBORN_CHECKLIST_TYPES.TRANSFER, '更新された入力')

      expect(db.update).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedInput)
    })

    it('所有者でない場合、エラーをスローする', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      await expect(
        osbornChecklistLib.upsertOsbornChecklistInput(1, 'user-456', OSBORN_CHECKLIST_TYPES.TRANSFER, 'テスト')
      ).rejects.toThrow('Unauthorized: OsbornChecklist not found or access denied')
    })

  })

  describe('updateOsbornChecklistIsResultsPublic', () => {
    it('結果公開の状態を更新できる', async () => {
      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      await osbornChecklistLib.updateOsbornChecklistIsResultsPublic(1, 'user-123', true)

      expect(db.update).toHaveBeenCalled()
      expect(mockChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          is_results_public: true,
        })
      )
      expect(mockChain.where).toHaveBeenCalled()
    })
  })
})
