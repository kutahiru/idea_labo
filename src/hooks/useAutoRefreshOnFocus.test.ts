import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAutoRefreshOnFocus } from './useAutoRefreshOnFocus'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Next.jsのモジュールをモック
vi.mock('next/navigation')

describe('useAutoRefreshOnFocus', () => {
  let mockRouter: AppRouterInstance
  let sessionStorageMock: Record<string, string>

  beforeEach(async () => {
    // routerのモック
    mockRouter = {
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as AppRouterInstance

    const { useRouter, usePathname } = await import('next/navigation')
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(usePathname).mockReturnValue('/test-path')

    // sessionStorageのモック
    sessionStorageMock = {}
    global.sessionStorage = {
      getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStorageMock[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete sessionStorageMock[key]
      }),
      clear: vi.fn(() => {
        sessionStorageMock = {}
      }),
      key: vi.fn(() => null),
      get length() {
        return Object.keys(sessionStorageMock).length
      },
    } as Storage

    // visibilityStateのモック
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初回実行時にsessionStorageにpathnameを保存する', () => {
    renderHook(() => useAutoRefreshOnFocus())

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'useAutoRefreshOnFocus_prevPathname',
      '/test-path'
    )
  })

  it('pathnameが変わった場合にrefreshが呼ばれる', () => {
    // 前回のpathname を設定
    sessionStorageMock['useAutoRefreshOnFocus_prevPathname'] = '/old-path'

    renderHook(() => useAutoRefreshOnFocus())

    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('pathnameが変わっていない場合はrefreshが呼ばれない', () => {
    // 同じpathnameを設定
    sessionStorageMock['useAutoRefreshOnFocus_prevPathname'] = '/test-path'

    renderHook(() => useAutoRefreshOnFocus())

    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })

  it('sessionStorageが空の場合はrefreshが呼ばれない', () => {
    renderHook(() => useAutoRefreshOnFocus())

    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })

  it('visibilitychangeイベントでvisibleになった時にrefreshが呼ばれる', () => {
    renderHook(() => useAutoRefreshOnFocus())

    // visibilitychangeイベントを発火
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('visibilitychangeイベントでhiddenの場合はrefreshが呼ばれない', () => {
    renderHook(() => useAutoRefreshOnFocus())

    vi.mocked(mockRouter.refresh).mockClear()

    // visibilitychangeイベントを発火（hidden）
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'hidden',
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })

  it('アンマウント時にイベントリスナーがクリーンアップされる', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useAutoRefreshOnFocus())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })

  it('pathname変更時に新しいpathnameがsessionStorageに保存される', () => {
    sessionStorageMock['useAutoRefreshOnFocus_prevPathname'] = '/old-path'

    renderHook(() => useAutoRefreshOnFocus())

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'useAutoRefreshOnFocus_prevPathname',
      '/test-path'
    )
  })
})
