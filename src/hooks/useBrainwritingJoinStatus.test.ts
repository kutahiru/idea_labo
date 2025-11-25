import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// モック用のグローバル変数（vi.hoistedで宣言）
const { mockToast } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// react-hot-toast をモック
vi.mock('react-hot-toast', () => ({
  default: mockToast,
}))

// client-utils をモック
vi.mock('@/lib/client-utils', () => ({
  parseJson: vi.fn((response) => response.json()),
}))

// brainwriting utils をモック
vi.mock('@/utils/brainwriting', () => ({
  USAGE_SCOPE: {
    XPOST: 'xpost',
    TEAM: 'team',
  },
}))

import { useBrainwritingJoinStatus } from './useBrainwritingJoinStatus'

describe('useBrainwritingJoinStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初期状態ではstatusがnullを返す', () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        currentCount: 3,
        maxCount: 6,
        isFull: false,
      }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    expect(result.current.status).toBe(null)
  })

  it('ログイン済みでX投稿版のステータスを取得できる', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        isLocked: false,
        lockExpiresAt: null,
        currentCount: 3,
        maxCount: 6,
        isFull: false,
      }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    await vi.waitFor(() => {
      expect(result.current.status).not.toBe(null)
    })

    expect(result.current.status).toEqual({
      isLocked: false,
      lockExpiresAt: null,
      currentCount: 3,
      maxCount: 6,
      isFull: false,
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/join-status?usageScope=xpost')
  })

  it('ログイン済みでチーム版のステータスを取得できる', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        currentCount: 4,
        maxCount: 6,
        isFull: false,
        canJoin: true,
      }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(2, 'team', true)
    )

    await vi.waitFor(() => {
      expect(result.current.status).not.toBe(null)
    })

    expect(result.current.status).toEqual({
      currentCount: 4,
      maxCount: 6,
      isFull: false,
      canJoin: true,
    })
  })

  it('lockExpiresAtがある場合はDate型に変換される', async () => {
    const lockExpiresAt = '2024-01-01T12:00:00Z'
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        isLocked: true,
        lockExpiresAt,
        currentCount: 6,
        maxCount: 6,
        isFull: true,
      }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    await vi.waitFor(() => {
      expect(result.current.status).not.toBe(null)
    })

    expect(result.current.status?.lockExpiresAt).toBeInstanceOf(Date)
    // toISOString()はミリ秒を含む形式で返すため、Dateの比較で確認
    expect(result.current.status?.lockExpiresAt?.getTime()).toBe(new Date(lockExpiresAt).getTime())
  })

  it('未ログイン時はAPIを呼び出さない', async () => {
    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', false)
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.status).toBe(null)
  })

  it('brainwritingIdがない場合はAPIを呼び出さない', async () => {
    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(0, 'xpost', true)
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.status).toBe(null)
  })

  it('10秒ごとにポーリングでステータスを更新する', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        currentCount: 3,
        maxCount: 6,
        isFull: false,
        canJoin: true,
      }),
    } as Response)

    renderHook(() =>
      useBrainwritingJoinStatus(1, 'team', true)
    )

    // 初回呼び出し
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // 10秒後
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // さらに10秒後
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  it('API応答がokでない場合はエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('3回連続エラー後にポーリングを停止し、エラートーストを表示する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'))

    renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    // 1回目のエラー
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // 2回目のエラー（10秒後）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // 3回目のエラー（さらに10秒後）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    await vi.waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('参加状況の取得に失敗しました。ページを再読み込みしてください。')
    })

    // 4回目は呼ばれない（ポーリング停止）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    expect(global.fetch).toHaveBeenCalledTimes(3)

    consoleSpy.mockRestore()
  })

  it('成功時はエラーカウンターがリセットされる', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 1回目: エラー
    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error('Network Error'))
      // 2回目: 成功
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          currentCount: 3,
          maxCount: 6,
          isFull: false,
          canJoin: true,
        }),
      } as Response)
      // 3回目以降: エラー
      .mockRejectedValue(new Error('Network Error'))

    renderHook(() =>
      useBrainwritingJoinStatus(1, 'team', true)
    )

    // 1回目のエラー
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // 2回目の成功（エラーカウンターリセット）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // 3回目、4回目のエラー
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000)
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4)
    })

    // エラートーストはまだ表示されない（リセットされたため2回のエラー）
    expect(mockToast.error).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('アンマウント時にインターバルがクリアされる', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        currentCount: 3,
        maxCount: 6,
        isFull: false,
        canJoin: true,
      }),
    } as Response)

    const { unmount } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'team', true)
    )

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    unmount()

    // アンマウント後はポーリングされない
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('デフォルト値が正しく設定される', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}), // 空のレスポンス
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoinStatus(1, 'xpost', true)
    )

    await vi.waitFor(() => {
      expect(result.current.status).not.toBe(null)
    })

    expect(result.current.status).toEqual({
      isLocked: false,
      lockExpiresAt: null,
      currentCount: 0,
      maxCount: 6,
      isFull: false,
    })
  })
})
