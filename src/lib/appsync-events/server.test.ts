import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { publishEvent } from './server'

describe('server', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    process.env = {
      ...originalEnv,
      APPSYNC_EVENTS_URL: 'https://example.com/events',
      APPSYNC_API_KEY: 'test-api-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('publishEvent', () => {
    it('正しいURLとヘッダーでリクエストを送信する', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      await publishEvent({
        namespace: 'brainwriting',
        channel: '/brainwriting/1',
        data: { type: 'USER_JOINED' },
      })

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
        },
        body: JSON.stringify({
          channel: 'brainwriting/brainwriting/1',
          events: [JSON.stringify({ type: 'USER_JOINED' })],
        }),
      })
    })

    it('チャンネル名にnamespaceがプレフィックスされる', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      await publishEvent({
        namespace: 'osborn',
        channel: '/osborn-checklist/5',
        data: { type: 'AI_GENERATION_COMPLETED' },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"channel":"osborn/osborn-checklist/5"'),
        })
      )
    })

    it('成功時に{ success: true }を返す', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      const result = await publishEvent({
        namespace: 'brainwriting',
        channel: '/brainwriting/1',
        data: { type: 'USER_JOINED' },
      })

      expect(result).toEqual({ success: true })
    })

    it('APPSYNC_EVENTS_URLが未設定の場合はエラーをスローする', async () => {
      delete process.env.APPSYNC_EVENTS_URL

      await expect(
        publishEvent({
          namespace: 'brainwriting',
          channel: '/brainwriting/1',
          data: { type: 'USER_JOINED' },
        })
      ).rejects.toThrow('APPSYNC_EVENTS_URL is not set')
    })

    it('APPSYNC_API_KEYが未設定の場合はエラーをスローする', async () => {
      delete process.env.APPSYNC_API_KEY

      await expect(
        publishEvent({
          namespace: 'brainwriting',
          channel: '/brainwriting/1',
          data: { type: 'USER_JOINED' },
        })
      ).rejects.toThrow('APPSYNC_API_KEY is not set')
    })

    it('APIレスポンスがokでない場合はエラーをスローする', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error'),
      } as Response)

      await expect(
        publishEvent({
          namespace: 'brainwriting',
          channel: '/brainwriting/1',
          data: { type: 'USER_JOINED' },
        })
      ).rejects.toThrow('Failed to publish event: 500')

      consoleSpy.mockRestore()
    })

    it('ネットワークエラー時はエラーを再スローする', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        publishEvent({
          namespace: 'brainwriting',
          channel: '/brainwriting/1',
          data: { type: 'USER_JOINED' },
        })
      ).rejects.toThrow('Network Error')

      consoleSpy.mockRestore()
    })

    it('複雑なデータオブジェクトを正しくシリアライズする', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      const complexData = {
        type: 'USER_JOINED',
        payload: {
          userId: 'user123',
          timestamp: '2024-01-01T00:00:00Z',
          metadata: {
            nested: true,
          },
        },
      }

      await publishEvent({
        namespace: 'brainwriting',
        channel: '/brainwriting/1',
        data: complexData,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            channel: 'brainwriting/brainwriting/1',
            events: [JSON.stringify(complexData)],
          }),
        })
      )
    })
  })
})
