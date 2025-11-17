/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as mandalartLib from './mandalart'

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

describe('Mandalart Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMandalartsByUserId', () => {
    it('ユーザーIDに紐づくマンダラート一覧を取得できる', async () => {
      const mockMandalarts = [
        {
          id: 1,
          userId: 'user-123',
          title: 'マンダラート1',
          themeName: 'テーマ1',
          description: '説明1',
          createdAt: new Date('2024-01-01'),
        },
      ]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockMandalarts),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await mandalartLib.getMandalartsByUserId('user-123')

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockMandalarts)
    })
  })

  describe('createMandalart', () => {
    it('新しいマンダラートを作成できる', async () => {
      const mockData = {
        title: '新しいマンダラート',
        themeName: 'テストテーマ',
        description: 'テスト説明',
      }

      const mockResult = {
        id: 1,
        title: '新しいマンダラート',
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

      const result = await mandalartLib.createMandalart('user-123', mockData)

      expect(db.transaction).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('updateMandalart', () => {
    it('マンダラートを更新できる', async () => {
      const mockUpdateData = {
        title: '更新されたマンダラート',
        themeName: '更新されたテーマ',
        description: '更新された説明',
      }

      const mockResult = {
        id: 1,
        title: '更新されたマンダラート',
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

      const result = await mandalartLib.updateMandalart(1, 'user-123', mockUpdateData)

      expect(db.update).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('deleteMandalart', () => {
    it('マンダラートを削除できる', async () => {
      const mockResult = { id: 1 }

      const mockChain = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.delete).mockReturnValue(mockChain as any)

      const result = await mandalartLib.deleteMandalart(1, 'user-123')

      expect(db.delete).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('getMandalartById', () => {
    it('マンダラートの詳細を取得できる', async () => {
      const mockMandalart = {
        id: 1,
        userId: 'user-123',
        title: 'テストマンダラート',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: false,
        createdAt: new Date(),
      }

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMandalart]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await mandalartLib.getMandalartById(1, 'user-123')

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockMandalart)
    })
  })

  describe('getMandalartInputsByMandalartId', () => {
    it('マンダラートIDに紐づく入力データを取得できる', async () => {
      const mockInputs = [
        {
          id: 1,
          mandalart_id: 1,
          section_row_index: 0,
          section_column_index: 0,
          row_index: 0,
          column_index: 0,
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

      const result = await mandalartLib.getMandalartInputsByMandalartId(1)

      expect(db.select).toHaveBeenCalled()
      expect(result).toEqual(mockInputs)
    })
  })

  describe('getMandalartDetailById', () => {
    it('マンダラートの詳細情報を取得できる', async () => {
      const mockMandalart = {
        id: 1,
        userId: 'user-123',
        title: 'テストマンダラート',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: false,
        createdAt: new Date(),
      }

      const mockInputs = [
        {
          id: 1,
          mandalart_id: 1,
          section_row_index: 0,
          section_column_index: 0,
          row_index: 0,
          column_index: 0,
          content: 'テスト入力',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // getMandalartById のモック
      const mockMandalartChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMandalart]),
      }

      // getMandalartInputsByMandalartId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockMandalartChain as any)
        .mockReturnValueOnce(mockInputsChain as any)

      const result = await mandalartLib.getMandalartDetailById(1, 'user-123')

      expect(result).toEqual({
        ...mockMandalart,
        inputs: mockInputs,
      })
    })

    it('マンダラートが存在しない場合、nullを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await mandalartLib.getMandalartDetailById(999, 'user-123')

      expect(result).toBeNull()
    })
  })

  describe('getMandalartDetailByToken', () => {
    it('公開トークンでマンダラート詳細を取得できる', async () => {
      const mockMandalart = {
        id: 1,
        userId: 'user-123',
        title: 'テストマンダラート',
        themeName: 'テストテーマ',
        description: 'テスト説明',
        publicToken: 'mock-token-123',
        isResultsPublic: true,
        createdAt: new Date(),
      }

      const mockInputs = [
        {
          id: 1,
          mandalart_id: 1,
          section_row_index: 0,
          section_column_index: 0,
          row_index: 0,
          column_index: 0,
          content: 'テスト入力',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      // getMandalartDetailByToken のマンダラート取得モック
      const mockMandalartChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMandalart]),
      }

      // getMandalartInputsByMandalartId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(mockMandalartChain as any)
        .mockReturnValueOnce(mockInputsChain as any)

      const result = await mandalartLib.getMandalartDetailByToken('mock-token-123')

      expect(result).toEqual({
        ...mockMandalart,
        inputs: mockInputs,
      })
    })

    it('トークンが存在しないまたは非公開の場合、nullを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await mandalartLib.getMandalartDetailByToken('invalid-token')

      expect(result).toBeNull()
    })
  })

  describe('upsertMandalartInput', () => {
    it('新規の入力データを作成できる', async () => {
      const mockMandalart = {
        id: 1,
        userId: 'user-123',
        title: 'テストマンダラート',
      }

      const mockInput = {
        id: 1,
        mandalart_id: 1,
        section_row_index: 0,
        section_column_index: 0,
        row_index: 0,
        column_index: 0,
        content: '新しい入力',
        created_at: new Date(),
        updated_at: new Date(),
      }

      // getMandalartById のモック
      const mockMandalartChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMandalart]),
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
        .mockReturnValueOnce(mockMandalartChain as any)
        .mockReturnValueOnce(mockExistingChain as any)

      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

      const result = await mandalartLib.upsertMandalartInput(1, 'user-123', 0, 0, 0, 0, '新しい入力')

      expect(db.insert).toHaveBeenCalled()
      expect(result).toEqual(mockInput)
    })

    it('既存の入力データを更新できる', async () => {
      const mockMandalart = {
        id: 1,
        userId: 'user-123',
        title: 'テストマンダラート',
      }

      const mockExistingInput = {
        id: 1,
        mandalart_id: 1,
        section_row_index: 0,
        section_column_index: 0,
        row_index: 0,
        column_index: 0,
        content: '古い入力',
      }

      const mockUpdatedInput = {
        ...mockExistingInput,
        content: '更新された入力',
        updated_at: new Date(),
      }

      // getMandalartById のモック
      const mockMandalartChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMandalart]),
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
        .mockReturnValueOnce(mockMandalartChain as any)
        .mockReturnValueOnce(mockExistingChain as any)

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any)

      const result = await mandalartLib.upsertMandalartInput(1, 'user-123', 0, 0, 0, 0, '更新された入力')

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
        mandalartLib.upsertMandalartInput(1, 'user-456', 0, 0, 0, 0, 'テスト')
      ).rejects.toThrow('Unauthorized: Mandalart not found or access denied')
    })
  })

  describe('updateMandalartIsResultsPublic', () => {
    it('結果公開の状態を更新できる', async () => {
      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      await mandalartLib.updateMandalartIsResultsPublic(1, 'user-123', true)

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
