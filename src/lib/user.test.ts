/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as userLib from './user'

// データベースをモック
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

import { db } from '@/db'

describe('User Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserById', () => {
    it('ユーザー情報を取得できる', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'テストユーザー',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        created_at: new Date('2024-01-01'),
      }

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await userLib.getUserById('user-123')

      expect(db.select).toHaveBeenCalled()
      expect(mockChain.from).toHaveBeenCalled()
      expect(mockChain.where).toHaveBeenCalled()
      expect(mockChain.limit).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockUser)
    })

    it('ユーザーが存在しない場合、nullを返す', async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(db.select).mockReturnValue(mockChain as any)

      const result = await userLib.getUserById('non-existent-user')

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('ユーザー情報を更新できる', async () => {
      const mockUpdateData = {
        name: '更新されたユーザー名',
      }

      const mockUpdatedUser = {
        id: 'user-123',
        name: '更新されたユーザー名',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        created_at: new Date('2024-01-01'),
      }

      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUpdatedUser]),
      }

      vi.mocked(db.update).mockReturnValue(mockChain as any)

      const result = await userLib.updateUser('user-123', mockUpdateData)

      expect(db.update).toHaveBeenCalled()
      expect(mockChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '更新されたユーザー名',
        })
      )
      expect(mockChain.where).toHaveBeenCalled()
      expect(mockChain.returning).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedUser)
    })
  })
})
