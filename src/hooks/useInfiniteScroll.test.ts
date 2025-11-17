import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInfiniteScroll } from './useInfiniteScroll'

type MockIntersectionObserver = {
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
}

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: (callback: IntersectionObserverCallback) => MockIntersectionObserver
  let observeCallback: IntersectionObserverCallback

  beforeEach(() => {
    vi.useFakeTimers()

    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observeCallback = callback
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }
    })

    global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const createMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `アイテム${i + 1}`,
    }))
  }

  it('初期表示で指定件数のデータを表示する', () => {
    const mockData = createMockData(50)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 20 })
    )

    expect(result.current.displayedData).toHaveLength(20)
    expect(result.current.displayedData[0].id).toBe(1)
    expect(result.current.hasMore).toBe(true)
  })

  it('全データが表示件数以下の場合、hasMoreがfalseになる', () => {
    const mockData = createMockData(10)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 20 })
    )

    expect(result.current.displayedData).toHaveLength(10)
    expect(result.current.hasMore).toBe(false)
  })

  it('hasMoreがfalseの場合は追加読み込みをしない', () => {
    const mockData = createMockData(20)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 20 })
    )

    expect(result.current.hasMore).toBe(false)

    observeCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.displayedData).toHaveLength(20)
  })

  it('allDataが変更された時にdisplayedDataをリセットする', () => {
    const mockData1 = createMockData(50)
    const { result, rerender } = renderHook(
      ({ data }) => useInfiniteScroll({ allData: data, itemsPerPage: 20 }),
      { initialProps: { data: mockData1 } }
    )

    expect(result.current.displayedData).toHaveLength(20)

    const mockData2 = createMockData(30)
    rerender({ data: mockData2 })

    expect(result.current.displayedData).toHaveLength(20)
    expect(result.current.displayedData[0].name).toBe('アイテム1')
  })

  it('observerRefが提供される', () => {
    const mockData = createMockData(50)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 20 })
    )

    expect(result.current.observerRef).toBeDefined()
    expect(result.current.observerRef.current).toBeNull()
  })

  it('IntersectionObserverがisIntersectingがfalseの場合は読み込まない', () => {
    const mockData = createMockData(50)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 20 })
    )

    observeCallback(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.displayedData).toHaveLength(20)
  })

  it('カスタムitemsPerPageが正しく機能する', () => {
    const mockData = createMockData(100)
    const { result } = renderHook(() =>
      useInfiniteScroll({ allData: mockData, itemsPerPage: 30 })
    )

    expect(result.current.displayedData).toHaveLength(30)
  })
})
