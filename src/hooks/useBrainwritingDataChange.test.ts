import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'
import { useBrainwritingDataChange } from './useBrainwritingDataChange'
import type { BrainwritingInputData } from '@/types/brainwriting'

// handleBrainwritingDataChange をモック
vi.mock('@/utils/brainwriting', () => ({
  handleBrainwritingDataChange: vi.fn(),
}))

import { handleBrainwritingDataChange } from '@/utils/brainwriting'

describe('useBrainwritingDataChange', () => {
  const mockSetCurrentInputs = vi.fn()
  const brainwritingId = 1
  const mockDate = new Date()

  // 完全な型を持つモックデータを生成するヘルパー関数
  const createMockInput = (overrides: Partial<BrainwritingInputData> & { id: number; brainwriting_sheet_id: number; row_index: number; column_index: number }): BrainwritingInputData => ({
    brainwriting_id: 1,
    input_user_id: 'user1',
    input_user_name: 'User 1',
    content: null,
    created_at: mockDate,
    updated_at: mockDate,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(handleBrainwritingDataChange).mockResolvedValue(undefined)
  })

  it('handleDataChange関数を返す', () => {
    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, mockSetCurrentInputs)
    )

    expect(result.current.handleDataChange).toBeDefined()
    expect(typeof result.current.handleDataChange).toBe('function')
  })

  it('handleDataChangeがhandleBrainwritingDataChangeを呼び出す', async () => {
    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, mockSetCurrentInputs)
    )

    await act(async () => {
      await result.current.handleDataChange(0, 1, 'テストアイデア', 100)
    })

    expect(handleBrainwritingDataChange).toHaveBeenCalledWith(
      brainwritingId,
      0,
      1,
      'テストアイデア',
      100
    )
  })

  it('handleDataChangeがstateを正しく更新する（既存の入力を更新）', async () => {
    const mockInputs: BrainwritingInputData[] = [
      createMockInput({ id: 1, brainwriting_sheet_id: 100, row_index: 0, column_index: 0, content: '古い内容' }),
      createMockInput({ id: 2, brainwriting_sheet_id: 100, row_index: 0, column_index: 1, content: 'そのまま' }),
      createMockInput({ id: 3, brainwriting_sheet_id: 200, row_index: 0, column_index: 0, content: '別シート' }),
    ]

    let updatedInputs: BrainwritingInputData[] = []
    const setInputsMock: Dispatch<SetStateAction<BrainwritingInputData[]>> = vi.fn((action) => {
      if (typeof action === 'function') {
        updatedInputs = action(mockInputs)
      } else {
        updatedInputs = action
      }
    })

    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, setInputsMock)
    )

    await act(async () => {
      await result.current.handleDataChange(0, 0, '新しい内容', 100)
    })

    expect(setInputsMock).toHaveBeenCalled()
    expect(updatedInputs[0].content).toBe('新しい内容')
    expect(updatedInputs[1].content).toBe('そのまま')
    expect(updatedInputs[2].content).toBe('別シート')
  })

  it('handleDataChangeが空文字列をnullとして保存する', async () => {
    const mockInputs: BrainwritingInputData[] = [
      createMockInput({ id: 1, brainwriting_sheet_id: 100, row_index: 0, column_index: 0, content: '内容あり' }),
    ]

    let updatedInputs: BrainwritingInputData[] = []
    const setInputsMock: Dispatch<SetStateAction<BrainwritingInputData[]>> = vi.fn((action) => {
      if (typeof action === 'function') {
        updatedInputs = action(mockInputs)
      } else {
        updatedInputs = action
      }
    })

    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, setInputsMock)
    )

    await act(async () => {
      await result.current.handleDataChange(0, 0, '', 100)
    })

    expect(updatedInputs[0].content).toBe(null)
  })

  it('一致しないシートIDの入力は更新されない', async () => {
    const mockInputs: BrainwritingInputData[] = [
      createMockInput({ id: 1, brainwriting_sheet_id: 100, row_index: 0, column_index: 0, content: '変更なし' }),
    ]

    let updatedInputs: BrainwritingInputData[] = []
    const setInputsMock: Dispatch<SetStateAction<BrainwritingInputData[]>> = vi.fn((action) => {
      if (typeof action === 'function') {
        updatedInputs = action(mockInputs)
      } else {
        updatedInputs = action
      }
    })

    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, setInputsMock)
    )

    await act(async () => {
      await result.current.handleDataChange(0, 0, '新しい内容', 200) // 違うシートID
    })

    expect(updatedInputs[0].content).toBe('変更なし')
  })

  it('一致しない行インデックスの入力は更新されない', async () => {
    const mockInputs: BrainwritingInputData[] = [
      createMockInput({ id: 1, brainwriting_sheet_id: 100, row_index: 0, column_index: 0, content: '変更なし' }),
    ]

    let updatedInputs: BrainwritingInputData[] = []
    const setInputsMock: Dispatch<SetStateAction<BrainwritingInputData[]>> = vi.fn((action) => {
      if (typeof action === 'function') {
        updatedInputs = action(mockInputs)
      } else {
        updatedInputs = action
      }
    })

    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, setInputsMock)
    )

    await act(async () => {
      await result.current.handleDataChange(1, 0, '新しい内容', 100) // 違う行インデックス
    })

    expect(updatedInputs[0].content).toBe('変更なし')
  })

  it('一致しない列インデックスの入力は更新されない', async () => {
    const mockInputs: BrainwritingInputData[] = [
      createMockInput({ id: 1, brainwriting_sheet_id: 100, row_index: 0, column_index: 0, content: '変更なし' }),
    ]

    let updatedInputs: BrainwritingInputData[] = []
    const setInputsMock: Dispatch<SetStateAction<BrainwritingInputData[]>> = vi.fn((action) => {
      if (typeof action === 'function') {
        updatedInputs = action(mockInputs)
      } else {
        updatedInputs = action
      }
    })

    const { result } = renderHook(() =>
      useBrainwritingDataChange(brainwritingId, setInputsMock)
    )

    await act(async () => {
      await result.current.handleDataChange(0, 1, '新しい内容', 100) // 違う列インデックス
    })

    expect(updatedInputs[0].content).toBe('変更なし')
  })

  it('異なるbrainwritingIdでフックを再生成できる', () => {
    const { result: result1 } = renderHook(() =>
      useBrainwritingDataChange(1, mockSetCurrentInputs)
    )
    const { result: result2 } = renderHook(() =>
      useBrainwritingDataChange(2, mockSetCurrentInputs)
    )

    expect(result1.current.handleDataChange).not.toBe(result2.current.handleDataChange)
  })
})
