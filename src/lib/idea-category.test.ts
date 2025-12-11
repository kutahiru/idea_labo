/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ideaCategoryLib from './idea-category'

// データベースをモック
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { db } from '@/db'

describe('IdeaCategory Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getIdeaCategoriesByUserId', () => {
    it('ユーザーIDに紐づくカテゴリ一覧を取得できる', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'カテゴリ1',
          description: '説明1',
          created_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'カテゴリ2',
          description: '説明2',
          created_at: new Date('2024-01-02'),
        },
      ]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCategories),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.getIdeaCategoriesByUserId('user-123')

      expect(db.select).toHaveBeenCalled()
      expect(mockChain.from).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(mockChain.orderBy).toHaveBeenCalled()
      expect(result).toEqual(mockCategories)
    })
  })

  describe('createIdeaCategory', () => {
    it('新しいアイデアカテゴリを作成できる', async () => {
      const mockCategoryData = {
        name: '新しいカテゴリ',
        description: 'テスト説明',
      }

      const mockResult = {
        id: 1,
        name: '新しいカテゴリ',
        description: 'テスト説明',
        created_at: new Date(),
      }

      const mockChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.insert).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.createIdeaCategory('user-123', mockCategoryData)

      expect(db.insert).toHaveBeenCalled()
      expect(mockChain.values).toHaveBeenCalledWith({
        user_id: 'user-123',
        name: mockCategoryData.name,
        description: mockCategoryData.description,
      })
      expect(result).toEqual(mockResult)
    })

    it('descriptionがnullの場合も作成できる', async () => {
      const mockCategoryData = {
        name: '新しいカテゴリ',
        description: null,
      }

      const mockResult = {
        id: 1,
        name: '新しいカテゴリ',
        description: null,
        created_at: new Date(),
      }

      const mockChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.insert).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.createIdeaCategory('user-123', mockCategoryData)

      expect(result.description).toBeNull()
    })
  })

  describe('updateIdeaCategory', () => {
    it('アイデアカテゴリを更新できる', async () => {
      const mockUpdateData = {
        name: '更新されたカテゴリ',
        description: '更新された説明',
      }

      const mockResult = {
        id: 1,
        name: '更新されたカテゴリ',
        description: '更新された説明',
        created_at: new Date(),
      }

      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.updateIdeaCategory(1, 'user-123', mockUpdateData)

      expect(db.update).toHaveBeenCalled()
      expect(mockChain.set).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('deleteIdeaCategory', () => {
    it('アイデアカテゴリを削除できる', async () => {
      const mockResult = { id: 1 }

      const mockChain = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.delete).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.deleteIdeaCategory(1, 'user-123')

      expect(db.delete).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('checkCategoryOwnership', () => {
    it('所有者の場合trueを返す', async () => {
      const mockResult = [{ id: 1 }]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockResult),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.checkCategoryOwnership(1, 'user-123')

      expect(result).toBe(true)
    })

    it('所有者でない場合falseを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaCategoryLib.checkCategoryOwnership(1, 'user-456')

      expect(result).toBe(false)
    })
  })
})
