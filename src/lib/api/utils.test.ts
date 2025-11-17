import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkAuth, apiErrors, validateIdRequest } from './utils'
import type { Session } from 'next-auth'

// NextAuth の auth 関数をモック
vi.mock('@/app/lib/auth', () => ({
  auth: vi.fn(),
}))

// テスト用のインポート
import { auth } from '@/app/lib/auth'

// auth 関数の型アサーション
const mockAuth = vi.mocked(auth) as unknown as ReturnType<typeof vi.fn<() => Promise<Session | null>>>

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkAuth', () => {
    it('認証済みユーザーの場合、userIdを返す', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      mockAuth.mockResolvedValue(mockSession)

      const result = await checkAuth()

      expect(result).toEqual({ userId: 'user-123' })
      expect('error' in result).toBe(false)
    })

    it('未認証の場合、401エラーを返す', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await checkAuth()

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error!.status).toBe(401)
        const json = await result.error!.json()
        expect(json).toEqual({ error: '認証が必要です' })
      }
    })

    it('userIdが存在しない場合、401エラーを返す', async () => {
      const mockSession: Session = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as Session
      mockAuth.mockResolvedValue(mockSession)

      const result = await checkAuth()

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error!.status).toBe(401)
      }
    })
  })

  describe('apiErrors', () => {
    it('notFound は404エラーを返す', async () => {
      const response = apiErrors.notFound('アイデア')

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json).toEqual({ error: 'アイデアが見つかりません' })
    })

    it('serverError は500エラーを返す', async () => {
      const response = apiErrors.serverError()

      expect(response.status).toBe(500)
      const json = await response.json()
      expect(json).toEqual({ error: 'サーバーエラーが発生しました' })
    })

    it('invalidId は400エラーを返す', async () => {
      const response = apiErrors.invalidId()

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json).toEqual({ error: '無効なIDです' })
    })

    it('invalidData は詳細なしで400エラーを返す', async () => {
      const response = apiErrors.invalidData()

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json).toEqual({ error: '入力データが無効です' })
    })

    it('invalidData は詳細ありで400エラーを返す', async () => {
      const details = [{ field: 'name', message: '必須項目です' }]
      const response = apiErrors.invalidData(details)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json).toEqual({
        error: '入力データが無効です',
        details,
      })
    })

    it('forbidden はデフォルトメッセージで403エラーを返す', async () => {
      const response = apiErrors.forbidden()

      expect(response.status).toBe(403)
      const json = await response.json()
      expect(json).toEqual({ error: 'アクセス権限がありません' })
    })

    it('forbidden はカスタムメッセージで403エラーを返す', async () => {
      const response = apiErrors.forbidden('この操作は許可されていません')

      expect(response.status).toBe(403)
      const json = await response.json()
      expect(json).toEqual({ error: 'この操作は許可されていません' })
    })
  })

  describe('validateIdRequest', () => {
    it('正常な認証と有効なIDの場合、userIdとidを返す', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      mockAuth.mockResolvedValue(mockSession)

      const params = Promise.resolve({ id: '456' })
      const result = await validateIdRequest(params)

      expect('error' in result).toBe(false)
      if (!('error' in result)) {
        expect(result.userId).toBe('user-123')
        expect(result.id).toBe(456)
      }
    })

    it('未認証の場合、401エラーを返す', async () => {
      mockAuth.mockResolvedValue(null)

      const params = Promise.resolve({ id: '456' })
      const result = await validateIdRequest(params)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error!.status).toBe(401)
      }
    })

    it('無効なIDの場合、400エラーを返す', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      mockAuth.mockResolvedValue(mockSession)

      const params = Promise.resolve({ id: 'invalid' })
      const result = await validateIdRequest(params)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error!.status).toBe(400)
        const json = await result.error!.json()
        expect(json).toEqual({ error: '無効なIDです' })
      }
    })

    it('空文字のIDの場合、400エラーを返す', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }
      mockAuth.mockResolvedValue(mockSession)

      const params = Promise.resolve({ id: '' })
      const result = await validateIdRequest(params)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error!.status).toBe(400)
      }
    })
  })
})
