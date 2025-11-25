import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// モック用のグローバル変数（vi.hoistedで宣言）
const { mockSubscribe, mockConnect, mockUseAmplifyConfig } = vi.hoisted(() => ({
  mockSubscribe: vi.fn(),
  mockConnect: vi.fn(),
  mockUseAmplifyConfig: vi.fn(() => ({ isConfigured: true })),
}))

// aws-amplify/data をモック
vi.mock('aws-amplify/data', () => ({
  events: {
    connect: mockConnect,
  },
}))

// AmplifyProvider をモック
vi.mock('@/components/providers/AmplifyProvider', () => ({
  useAmplifyConfig: mockUseAmplifyConfig,
}))

// event-types をモック
vi.mock('@/lib/appsync-events/event-types', () => ({
  BRAINWRITING_EVENT_TYPES: {
    USER_JOINED: 'USER_JOINED',
    BRAINWRITING_STARTED: 'BRAINWRITING_STARTED',
    SHEET_ROTATED: 'SHEET_ROTATED',
  },
}))

import { useBrainwritingRealtime } from './useBrainwritingRealtime'
import type { BrainwritingUserData, BrainwritingSheetData, BrainwritingInputData } from '@/types/brainwriting'

describe('useBrainwritingRealtime', () => {
  const mockDate = new Date()

  const mockInitialUsers: BrainwritingUserData[] = [
    {
      id: 1,
      brainwriting_id: 1,
      user_id: 'user1',
      user_name: 'User 1',
      created_at: mockDate,
      updated_at: mockDate,
    },
  ]

  const mockInitialSheets: BrainwritingSheetData[] = [
    {
      id: 1,
      brainwriting_id: 1,
      current_user_id: 'user1',
      lock_expires_at: null,
      created_at: mockDate,
      updated_at: mockDate,
    },
  ]

  const mockInitialInputs: BrainwritingInputData[] = [
    {
      id: 1,
      brainwriting_id: 1,
      brainwriting_sheet_id: 1,
      input_user_id: 'user1',
      input_user_name: 'User 1',
      row_index: 0,
      column_index: 0,
      content: 'test',
      created_at: mockDate,
      updated_at: mockDate,
    },
  ]

  let mockUnsubscribe: { unsubscribe: ReturnType<typeof vi.fn> }
  let subscribeCallback: { next: (data: unknown) => void; error: (error: unknown) => void }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockUseAmplifyConfig.mockReturnValue({ isConfigured: true })

    mockUnsubscribe = { unsubscribe: vi.fn() }
    mockSubscribe.mockImplementation((callback) => {
      subscribeCallback = callback
      return mockUnsubscribe
    })

    mockConnect.mockResolvedValue({
      subscribe: mockSubscribe,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期値が正しく設定される', () => {
    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    expect(result.current.users).toEqual(mockInitialUsers)
    expect(result.current.sheets).toEqual(mockInitialSheets)
    expect(result.current.inputs).toEqual(mockInitialInputs)
  })

  it('Amplify設定完了後に接続を確立する', async () => {
    renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('brainwriting/brainwriting/1')
    })
  })

  it('Amplify設定が完了していない場合は接続しない', () => {
    mockUseAmplifyConfig.mockReturnValue({ isConfigured: false })

    renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    expect(mockConnect).not.toHaveBeenCalled()
  })

  it('USER_JOINEDイベントで参加者一覧を再取得する', async () => {
    const newUsers = [...mockInitialUsers, {
      id: 2,
      brainwriting_id: 1,
      user_id: 'user2',
      user_name: 'User 2',
      created_at: mockDate,
      updated_at: mockDate,
    }]
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: newUsers }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    // USER_JOINEDイベントをシミュレート
    act(() => {
      subscribeCallback.next({ event: { type: 'USER_JOINED' } })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/users')
    })

    await waitFor(() => {
      expect(result.current.users).toEqual(newUsers)
    })
  })

  it('BRAINWRITING_STARTEDイベントでシート情報を再取得する', async () => {
    const newSheets = [
      {
        id: 1,
        brainwriting_id: 1,
        current_user_id: 'user2',
        lock_expires_at: null,
        created_at: mockDate,
        updated_at: mockDate,
      },
    ]
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sheets: newSheets }),
    } as Response)

    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    // BRAINWRITING_STARTEDイベントをシミュレート
    act(() => {
      subscribeCallback.next({ event: { type: 'BRAINWRITING_STARTED' } })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/sheets')
    })

    await waitFor(() => {
      expect(result.current.sheets).toEqual(newSheets)
    })
  })

  it('SHEET_ROTATEDイベントでシート情報を再取得する', async () => {
    const newSheets = [
      {
        id: 1,
        brainwriting_id: 1,
        current_user_id: null,
        lock_expires_at: null,
        created_at: mockDate,
        updated_at: mockDate,
      },
    ]
    const newInputs = [
      {
        id: 1,
        brainwriting_id: 1,
        brainwriting_sheet_id: 1,
        input_user_id: 'user1',
        input_user_name: 'User 1',
        row_index: 0,
        column_index: 0,
        content: 'updated',
        created_at: mockDate,
        updated_at: mockDate,
      },
    ]

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sheets: newSheets }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ inputs: newInputs }),
      } as Response)

    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    // SHEET_ROTATEDイベントをシミュレート（全員完了のシナリオ）
    act(() => {
      subscribeCallback.next({ event: { type: 'SHEET_ROTATED' } })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/sheets')
    })

    // 全員完了（current_user_id === null）なので入力データも取得
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/inputs')
    })
  })

  it('接続成功時にisConnectedがtrueになる', async () => {
    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })
  })

  it('接続エラー時にisConnectedがfalseになる', async () => {
    mockConnect.mockRejectedValueOnce(new Error('接続エラー'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false)
    })

    consoleSpy.mockRestore()
  })

  it('アンマウント時にunsubscribeが呼ばれる', async () => {
    const { unmount } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe.unsubscribe).toHaveBeenCalled()
  })

  it('API取得エラー時はコンソールにエラーを出力する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API Error'))

    renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    act(() => {
      subscribeCallback.next({ event: { type: 'USER_JOINED' } })
    })

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    consoleSpy.mockRestore()
  })

  it('JSON文字列形式のイベントも正しく処理できる', async () => {
    const newUsers = [...mockInitialUsers, {
      id: 2,
      brainwriting_id: 1,
      user_id: 'user2',
      user_name: 'User 2',
      created_at: mockDate,
      updated_at: mockDate,
    }]
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: newUsers }),
    } as Response)

    renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    // JSON文字列形式のイベントをシミュレート
    act(() => {
      subscribeCallback.next(JSON.stringify({ event: { type: 'USER_JOINED' } }))
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/brainwritings/1/users')
    })
  })

  it('subscriptionエラー時にisConnectedがfalseになる', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() =>
      useBrainwritingRealtime({
        brainwritingId: 1,
        initialUsers: mockInitialUsers,
        initialSheets: mockInitialSheets,
        initialInputs: mockInitialInputs,
      })
    )

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    act(() => {
      subscribeCallback.error(new Error('Subscription Error'))
    })

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false)
    })

    consoleSpy.mockRestore()
  })
})
