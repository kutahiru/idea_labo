import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { BrainwritingListItem } from '@/types/brainwriting'

// モック用のグローバル変数（vi.hoistedで宣言）
const { mockPush, mockSignIn, mockToast } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignIn: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// next/navigation をモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// next-auth/react をモック
vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
}))

// react-hot-toast をモック
vi.mock('react-hot-toast', () => ({
  default: mockToast,
}))

// client-utils をモック
vi.mock('@/lib/client-utils', () => ({
  parseJsonSafe: vi.fn((response, defaultValue) => response.json().catch(() => defaultValue)),
  parseJson: vi.fn((response) => response.json()),
}))

// brainwriting utils をモック
vi.mock('@/utils/brainwriting', () => ({
  USAGE_SCOPE: {
    XPOST: 'xpost',
    TEAM: 'team',
  },
}))

import { useBrainwritingJoin } from './useBrainwritingJoin'

describe('useBrainwritingJoin', () => {
  const mockBrainwritingXpost: BrainwritingListItem = {
    id: 1,
    title: 'テストブレインライティング',
    themeName: 'テストテーマ',
    description: null,
    usageScope: 'xpost',
    userId: 'user1',
    createdAt: new Date(),
  }

  const mockBrainwritingTeam: BrainwritingListItem = {
    id: 2,
    title: 'チームブレインライティング',
    themeName: 'チームテーマ',
    description: null,
    usageScope: 'team',
    userId: 'user1',
    createdAt: new Date(),
  }

  const token = 'test-token-123'

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()

    // process.env のモック
    vi.stubEnv('NEXT_PUBLIC_BRAINWRITING_LOCK_DURATION_MINUTES', '10')
  })

  it('handleJoin関数を返す', () => {
    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, true)
    )

    expect(result.current.handleJoin).toBeDefined()
    expect(typeof result.current.handleJoin).toBe('function')
  })

  it('未ログイン時はGoogleログインにリダイレクトする', async () => {
    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, false)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    const expectedRedirectUrl = encodeURIComponent('/brainwritings/invite/' + token)
    expect(mockSignIn).toHaveBeenCalledWith('google', {
      callbackUrl: '/auth/callback?redirect=' + expectedRedirectUrl,
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('ログイン済み時にX投稿版の参加が成功する', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sheetId: 100 }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, true)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brainwritingId: mockBrainwritingXpost.id,
        usageScope: mockBrainwritingXpost.usageScope,
      }),
    })

    expect(mockToast.success).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/brainwritings/sheet/100/input')
  })

  it('ログイン済み時にチーム版の参加が成功する', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sheetId: 200 }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingTeam, token, true)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    expect(mockToast.success).toHaveBeenCalledWith('参加しました', { duration: 5000 })
    expect(mockPush).toHaveBeenCalledWith('/brainwritings/' + mockBrainwritingTeam.id + '/team')
  })

  it('APIエラー時にエラートーストを表示する', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'すでに参加しています' }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, true)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    expect(mockToast.error).toHaveBeenCalledWith('すでに参加しています')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('APIエラーでエラーメッセージがない場合はデフォルトメッセージを表示', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, true)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    expect(mockToast.error).toHaveBeenCalledWith('参加に失敗しました')
  })

  it('ネットワークエラー時にエラートーストを表示する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() =>
      useBrainwritingJoin(mockBrainwritingXpost, token, true)
    )

    await act(async () => {
      await result.current.handleJoin()
    })

    expect(mockToast.error).toHaveBeenCalledWith('参加処理中にエラーが発生しました')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
