import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from './useSearch'

describe('useSearch', () => {
  const mockData = [
    { id: 1, name: 'テストアイデア1', description: '説明1' },
    { id: 2, name: 'テストアイデア2', description: '説明2' },
    { id: 3, name: 'サンプル', description: 'テスト説明' },
  ]

  it('初期状態で全データを返す', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    expect(result.current.searchTerm).toBe('')
    expect(result.current.filteredData).toEqual(mockData)
  })

  it('検索語でデータをフィルタリングできる', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('テストアイデア')
    })

    expect(result.current.filteredData).toHaveLength(2)
    expect(result.current.filteredData[0].id).toBe(1)
    expect(result.current.filteredData[1].id).toBe(2)
  })

  it('複数フィールドで検索できる', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('テスト説明')
    })

    expect(result.current.filteredData).toHaveLength(1)
    expect(result.current.filteredData[0].id).toBe(3)
  })

  it('大文字小文字を区別しない検索ができる', () => {
    const dataWithEnglish = [
      { id: 1, name: 'Test Idea', description: 'Description' },
      { id: 2, name: 'Another', description: 'test description' },
    ]

    const { result } = renderHook(() =>
      useSearch({ data: dataWithEnglish, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('TEST')
    })

    expect(result.current.filteredData).toHaveLength(2)
  })

  it('空白のみの検索語では全データを返す', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('   ')
    })

    expect(result.current.filteredData).toEqual(mockData)
  })

  it('一致するデータがない場合は空配列を返す', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('存在しないキーワード')
    })

    expect(result.current.filteredData).toHaveLength(0)
  })

  it('検索語をクリアすると全データが戻る', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name', 'description'] })
    )

    act(() => {
      result.current.setSearchTerm('テストアイデア')
    })

    expect(result.current.filteredData.length).toBeLessThan(mockData.length)

    act(() => {
      result.current.setSearchTerm('')
    })

    expect(result.current.filteredData).toEqual(mockData)
  })

  it('データが変更されると再フィルタリングされる', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useSearch({ data, searchFields: ['name', 'description'] }),
      { initialProps: { data: mockData } }
    )

    act(() => {
      result.current.setSearchTerm('テストアイデア')
    })

    expect(result.current.filteredData).toHaveLength(2)

    const newData = [
      { id: 1, name: 'テストアイデア1', description: '説明1' },
    ]

    rerender({ data: newData })

    expect(result.current.filteredData).toHaveLength(1)
  })

  it('指定されたフィールドのみを検索対象とする', () => {
    const { result } = renderHook(() =>
      useSearch({ data: mockData, searchFields: ['name'] })
    )

    act(() => {
      result.current.setSearchTerm('説明')
    })

    // nameフィールドのみ検索するので、descriptionの「説明」は検索対象外
    expect(result.current.filteredData).toHaveLength(0)
  })
})
