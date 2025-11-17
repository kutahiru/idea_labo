/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ideaLib from './idea'

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

describe('Idea Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getIdeasByCategoryId', () => {
    it('カテゴリIDに紐づくアイデア一覧を取得できる', async () => {
      const mockIdeas = [
        {
          id: 1,
          name: 'アイデア1',
          description: '説明1',
          priority: 'high',
          created_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'アイデア2',
          description: '説明2',
          priority: 'medium',
          created_at: new Date('2024-01-02'),
        },
      ]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockIdeas),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaLib.getIdeasByCategoryId(1, 'user-123')

      expect(db.select).toHaveBeenCalled()
      expect(mockChain.from).toHaveBeenCalled()
      expect(mockChain.innerJoin).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(mockChain.orderBy).toHaveBeenCalled()
      expect(result).toEqual(mockIdeas)
    })
  })

  describe('createIdea', () => {
    it('新しいアイデアを作成できる', async () => {
      const mockIdeaData = {
        name: '新しいアイデア',
        description: 'テスト説明',
        priority: 'high' as const,
      }

      const mockResult = {
        id: 1,
        name: '新しいアイデア',
        description: 'テスト説明',
        priority: 'high',
        created_at: new Date(),
      }

      const mockChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.insert).mockReturnValue(mockChain as any)

      const result = await ideaLib.createIdea(1, mockIdeaData)

      expect(db.insert).toHaveBeenCalled()
      expect(mockChain.values).toHaveBeenCalledWith({
        idea_category_id: 1,
        name: mockIdeaData.name,
        description: mockIdeaData.description,
        priority: mockIdeaData.priority,
      })
      expect(result).toEqual(mockResult)
    })

    it('descriptionがnullの場合も作成できる', async () => {
      const mockIdeaData = {
        name: '新しいアイデア',
        description: null,
        priority: 'medium' as const,
      }

      const mockResult = {
        id: 1,
        name: '新しいアイデア',
        description: null,
        priority: 'medium',
        created_at: new Date(),
      }

      const mockChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.insert).mockReturnValue(mockChain as any)

      const result = await ideaLib.createIdea(1, mockIdeaData)

      expect(result.description).toBeNull()
    })
  })

  describe('updateIdea', () => {
    it('アイデアを更新できる', async () => {
      const mockUpdateData = {
        name: '更新されたアイデア',
        description: '更新された説明',
        priority: 'low' as const,
      }

      const mockResult = {
        id: 1,
        name: '更新されたアイデア',
        description: '更新された説明',
        priority: 'low',
        created_at: new Date(),
      }

      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      const result = await ideaLib.updateIdea(1, 1, mockUpdateData)

      expect(db.update).toHaveBeenCalled()
      expect(mockChain.set).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('deleteIdea', () => {
    it('アイデアを削除できる', async () => {
      const mockResult = { id: 1 }

      const mockChain = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      }

      vi.mocked(db.delete).mockReturnValue(mockChain as any)

      const result = await ideaLib.deleteIdea(1)

      expect(db.delete).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('checkIdeaOwnership', () => {
    it('所有者の場合trueを返す', async () => {
      const mockResult = [{ id: 1 }]

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockResult),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaLib.checkIdeaOwnership(1, 'user-123')

      expect(result).toBe(true)
    })

    it('所有者でない場合falseを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await ideaLib.checkIdeaOwnership(1, 'user-456')

      expect(result).toBe(false)
    })
  })
})
