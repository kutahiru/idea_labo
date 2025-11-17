import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  USAGE_SCOPE,
  USAGE_SCOPE_LABELS,
  getUsageScopeLabel,
  sortUsersByFirstRow,
  convertToRowData,
  handleBrainwritingDataChange,
} from './brainwriting'
import type { BrainwritingInputData, BrainwritingUserData } from '@/types/brainwriting'

describe('Brainwriting Utils', () => {
  describe('USAGE_SCOPE', () => {
    it('正しい値を持つ', () => {
      expect(USAGE_SCOPE.XPOST).toBe('xpost')
      expect(USAGE_SCOPE.TEAM).toBe('team')
    })
  })

  describe('USAGE_SCOPE_LABELS', () => {
    it('すべてのUSAGE_SCOPEに対応するラベルが定義されている', () => {
      expect(USAGE_SCOPE_LABELS[USAGE_SCOPE.XPOST]).toBe('X投稿')
      expect(USAGE_SCOPE_LABELS[USAGE_SCOPE.TEAM]).toBe('チーム利用')
    })
  })

  describe('getUsageScopeLabel', () => {
    it('xpostのラベルを返す', () => {
      const label = getUsageScopeLabel(USAGE_SCOPE.XPOST)
      expect(label).toBe('X投稿')
    })

    it('teamのラベルを返す', () => {
      const label = getUsageScopeLabel(USAGE_SCOPE.TEAM)
      expect(label).toBe('チーム利用')
    })
  })

  describe('sortUsersByFirstRow', () => {
    const users: BrainwritingUserData[] = [
      {
        id: 1,
        brainwriting_id: 1,
        user_id: 'user-1',
        user_name: 'ユーザー1',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id: 2,
        brainwriting_id: 1,
        user_id: 'user-2',
        user_name: 'ユーザー2',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id: 3,
        brainwriting_id: 1,
        user_id: 'user-3',
        user_name: 'ユーザー3',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ]

    it('1行目のユーザーを先頭にソートできる', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-2',
          input_user_name: 'ユーザー2',
          row_index: 0,
          column_index: 0,
          content: 'test',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = sortUsersByFirstRow(sheetInputs, users)

      expect(result[0].user_id).toBe('user-2')
      expect(result[1].user_id).toBe('user-3')
      expect(result[2].user_id).toBe('user-1')
    })

    it('1行目の入力がない場合、元の配列を返す', () => {
      const sheetInputs: BrainwritingInputData[] = []

      const result = sortUsersByFirstRow(sheetInputs, users)

      expect(result).toEqual(users)
      expect(result).not.toBe(users) // 新しい配列として返される
    })

    it('1行目のユーザーがusers配列に存在しない場合、元の配列を返す', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-999',
          input_user_name: '存在しないユーザー',
          row_index: 0,
          column_index: 0,
          content: 'test',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = sortUsersByFirstRow(sheetInputs, users)

      expect(result).toEqual(users)
    })

    it('最初のユーザーが1行目の場合、順序が変わらない', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-1',
          input_user_name: 'ユーザー1',
          row_index: 0,
          column_index: 0,
          content: 'test',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = sortUsersByFirstRow(sheetInputs, users)

      expect(result).toEqual(users)
    })
  })

  describe('convertToRowData', () => {
    const users: BrainwritingUserData[] = [
      {
        id: 1,
        brainwriting_id: 1,
        user_id: 'user-1',
        user_name: 'ユーザー1',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id: 2,
        brainwriting_id: 1,
        user_id: 'user-2',
        user_name: 'ユーザー2',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ]

    it('入力データを行データに変換できる', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-1',
          input_user_name: 'ユーザー1',
          row_index: 0,
          column_index: 0,
          content: 'アイデア1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-1',
          input_user_name: 'ユーザー1',
          row_index: 0,
          column_index: 1,
          content: 'アイデア2',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = convertToRowData(sheetInputs, users)

      expect(result[0].name).toBe('ユーザー1')
      expect(result[0].ideas[0]).toBe('アイデア1')
      expect(result[0].ideas[1]).toBe('アイデア2')
      expect(result[0].ideas[2]).toBe('')
    })

    it('常に6行のデータを返す', () => {
      const sheetInputs: BrainwritingInputData[] = []

      const result = convertToRowData(sheetInputs, users)

      expect(result).toHaveLength(6)
    })

    it('不足している行にはユーザー名またはデフォルト名を設定する', () => {
      const sheetInputs: BrainwritingInputData[] = []

      const result = convertToRowData(sheetInputs, users)

      expect(result[0].name).toBe('ユーザー1')
      expect(result[1].name).toBe('ユーザー2')
      expect(result[2].name).toBe('参加者3')
      expect(result[3].name).toBe('参加者4')
    })

    it('空の入力データの場合、すべて空のアイデアを持つ', () => {
      const sheetInputs: BrainwritingInputData[] = []

      const result = convertToRowData(sheetInputs, users)

      result.forEach(row => {
        expect(row.ideas).toEqual(['', '', ''])
      })
    })

    it('row_indexでソートされている', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 2,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-2',
          input_user_name: 'ユーザー2',
          row_index: 1,
          column_index: 0,
          content: '行1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-1',
          input_user_name: 'ユーザー1',
          row_index: 0,
          column_index: 0,
          content: '行0',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = convertToRowData(sheetInputs, users)

      expect(result[0].ideas[0]).toBe('行0')
      expect(result[1].ideas[0]).toBe('行1')
    })

    it('nullのcontentは空文字列に変換される', () => {
      const sheetInputs: BrainwritingInputData[] = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: 'user-1',
          input_user_name: 'ユーザー1',
          row_index: 0,
          column_index: 0,
          content: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ]

      const result = convertToRowData(sheetInputs, users)

      expect(result[0].ideas[0]).toBe('')
    })
  })

  describe('handleBrainwritingDataChange', () => {
    const originalFetch = global.fetch
    const mockFetch = vi.fn()

    beforeEach(() => {
      global.fetch = mockFetch
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(window, 'alert').mockImplementation(() => {})
    })

    afterEach(() => {
      global.fetch = originalFetch
      vi.restoreAllMocks()
    })

    it('正しくAPIリクエストを送信できる', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      })

      await handleBrainwritingDataChange(1, 0, 0, 'テストアイデア', 10)

      expect(mockFetch).toHaveBeenCalledWith('/api/brainwritings/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brainwritingId: 1,
          brainwritingSheetId: 10,
          rowIndex: 0,
          columnIndex: 0,
          content: 'テストアイデア',
        }),
      })
    })

    it('保存成功時にコンソールログを出力する', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      })

      await handleBrainwritingDataChange(1, 2, 1, 'アイデア', 10)

      expect(console.log).toHaveBeenCalledWith('保存成功: 行3, アイデア2: アイデア')
    })

    it('APIエラー時にアラートを表示する', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      })

      await handleBrainwritingDataChange(1, 0, 0, 'テスト', 10)

      expect(console.error).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith('保存に失敗しました。再度お試しください。')
    })

    it('ネットワークエラー時にアラートを表示する', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await handleBrainwritingDataChange(1, 0, 0, 'テスト', 10)

      expect(console.error).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith('保存に失敗しました。再度お試しください。')
    })
  })
})
