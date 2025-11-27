import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// モック用のグローバル変数（vi.hoistedで宣言）
const { mockPush, mockRefresh, mockToast } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// next/navigation をモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
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

import { useResourceSubmit, useResourceDelete } from './useResourceSubmit'

describe('useResourceSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('新規作成', () => {
    it('POSTリクエストが正しく送信される', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      } as Response)

      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: null,
        })
      )

      await act(async () => {
        await result.current({ title: '新しいアイデア', description: '説明' })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '新しいアイデア', description: '説明' }),
      })

      expect(mockToast.success).toHaveBeenCalledWith('アイデアが作成されました')
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('additionalDataがマージされる', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      } as Response)

      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: null,
          additionalData: { categoryId: 5 },
        })
      )

      await act(async () => {
        await result.current({ title: '新しいアイデア' })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '新しいアイデア', categoryId: 5 }),
      })
    })

    it('onSuccessコールバックが呼ばれる', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      } as Response)

      const onSuccess = vi.fn()
      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: null,
          onSuccess,
        })
      )

      await act(async () => {
        await result.current({ title: '新しいアイデア' })
      })

      expect(onSuccess).toHaveBeenCalledWith(false, { id: 1 })
      expect(mockRefresh).not.toHaveBeenCalled()
    })
  })

  describe('更新', () => {
    it('PUTリクエストが正しく送信される', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      } as Response)

      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: { id: 1 },
        })
      )

      await act(async () => {
        await result.current({ title: '更新したアイデア' })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/ideas/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '更新したアイデア' }),
      })

      expect(mockToast.success).toHaveBeenCalledWith('アイデアが更新されました')
    })

    it('onSuccessコールバックにisEditがtrueで渡される', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      } as Response)

      const onSuccess = vi.fn()
      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: { id: 1 },
          onSuccess,
        })
      )

      await act(async () => {
        await result.current({ title: '更新したアイデア' })
      })

      expect(onSuccess).toHaveBeenCalledWith(true, { id: 1 })
    })
  })

  describe('エラーハンドリング', () => {
    it('APIエラー時にエラートーストを表示する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'バリデーションエラー' }),
      } as Response)

      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: null,
        })
      )

      await act(async () => {
        await result.current({ title: '' })
      })

      expect(mockToast.error).toHaveBeenCalledWith('エラーが発生しました: バリデーションエラー')
      expect(mockRefresh).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('ネットワークエラー時にエラートーストを表示する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

      const { result } = renderHook(() =>
        useResourceSubmit({
          apiPath: '/api/ideas',
          resourceName: 'アイデア',
          editingData: null,
        })
      )

      await act(async () => {
        await result.current({ title: 'テスト' })
      })

      expect(mockToast.error).toHaveBeenCalledWith('エラーが発生しました: Network Error')
      consoleSpy.mockRestore()
    })
  })
})

describe('useResourceDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    global.confirm = vi.fn()
  })

  it('確認ダイアログでキャンセルすると削除されない', async () => {
    vi.mocked(global.confirm).mockReturnValue(false)

    const { result } = renderHook(() =>
      useResourceDelete({
        apiPath: '/api/ideas',
        resourceName: 'アイデア',
      })
    )

    await act(async () => {
      await result.current({ id: 1 })
    })

    expect(global.confirm).toHaveBeenCalledWith('本当に削除しますか？')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('確認ダイアログでOKするとDELETEリクエストが送信される', async () => {
    vi.mocked(global.confirm).mockReturnValue(true)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const { result } = renderHook(() =>
      useResourceDelete({
        apiPath: '/api/ideas',
        resourceName: 'アイデア',
      })
    )

    await act(async () => {
      await result.current({ id: 1 })
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/ideas/1', {
      method: 'DELETE',
    })

    expect(mockToast.success).toHaveBeenCalledWith('アイデアが削除されました')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('onSuccessコールバックが呼ばれる', async () => {
    vi.mocked(global.confirm).mockReturnValue(true)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useResourceDelete({
        apiPath: '/api/ideas',
        resourceName: 'アイデア',
        onSuccess,
      })
    )

    await act(async () => {
      await result.current({ id: 1 })
    })

    expect(onSuccess).toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('APIエラー時にエラートーストを表示する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.confirm).mockReturnValue(true)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: '削除権限がありません' }),
    } as Response)

    const { result } = renderHook(() =>
      useResourceDelete({
        apiPath: '/api/ideas',
        resourceName: 'アイデア',
      })
    )

    await act(async () => {
      await result.current({ id: 1 })
    })

    expect(mockToast.error).toHaveBeenCalledWith('エラーが発生しました: 削除権限がありません')
    expect(mockRefresh).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('ネットワークエラー時にエラートーストを表示する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.confirm).mockReturnValue(true)
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() =>
      useResourceDelete({
        apiPath: '/api/ideas',
        resourceName: 'アイデア',
      })
    )

    await act(async () => {
      await result.current({ id: 1 })
    })

    expect(mockToast.error).toHaveBeenCalledWith('エラーが発生しました: Network Error')
    consoleSpy.mockRestore()
  })
})
