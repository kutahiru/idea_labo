import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { postBrainwritingToX, postMandalartToX, postOsbornChecklistToX } from './x-post'
import type { BrainwritingListItem } from '@/types/brainwriting'
import type { MandalartListItem } from '@/types/mandalart'
import type { OsbornChecklistListItem } from '@/types/osborn-checklist'

// トークン生成関数をモック
vi.mock('@/lib/token', () => ({
  generateInviteUrl: vi.fn((token: string) => `https://example.com/invite/${token}`),
  generateMandalartPublicUrl: vi.fn((token: string) => `https://example.com/mandalart/${token}`),
  generateOsbornChecklistPublicUrl: vi.fn((token: string) => `https://example.com/osborn/${token}`),
}))

describe('X-Post Utils', () => {
  let windowOpenSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // window.openをモック
    windowOpenSpy = vi.fn()
    Object.defineProperty(window, 'open', {
      value: windowOpenSpy,
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('postBrainwritingToX', () => {
    const mockBrainwriting: BrainwritingListItem = {
      id: 1,
      title: 'テストタイトル',
      themeName: 'テストテーマ',
      description: 'テスト説明',
      userId: 'user-123',
      usageScope: 'xpost',
      inviteToken: 'test-invite-token',
      createdAt: new Date('2024-01-01'),
    }

    it('作成者として投稿できる', () => {
      postBrainwritingToX({
        brainwriting: mockBrainwriting,
        isOwner: true,
      })

      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string

      expect(url).toContain('https://twitter.com/intent/tweet?text=')
      const decodedText = decodeURIComponent(url.split('text=')[1])
      expect(decodedText).toContain('🧠ブレインライティング')
      expect(decodedText).toContain('📝テーマ:テストテーマ')
      expect(decodedText).toContain('皆さんのアイデアをお待ちしています')
      expect(decodedText).toContain('https://example.com/invite/test-invite-token')
      expect(decodedText).toContain('#アイデア研究所')
    })

    it('参加者として投稿できる', () => {
      postBrainwritingToX({
        brainwriting: mockBrainwriting,
        isOwner: false,
      })

      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string

      const decodedText = decodeURIComponent(url.split('text=')[1])
      expect(decodedText).toContain('回答しました！')
      expect(decodedText).toContain('🧠ブレインライティング')
      expect(decodedText).toContain('📝テーマ:テストテーマ')
    })

    it('残りユーザー数が0のとき全員集まったメッセージを表示', () => {
      postBrainwritingToX({
        brainwriting: mockBrainwriting,
        isOwner: false,
        remainingUserCount: 0,
      })

      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string
      const decodedText = decodeURIComponent(url.split('text=')[1])

      expect(decodedText).toContain('全ての回答が集まりました！')
    })

    it('残りユーザー数が1以上のとき残り人数を表示', () => {
      postBrainwritingToX({
        brainwriting: mockBrainwriting,
        isOwner: false,
        remainingUserCount: 3,
      })

      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string
      const decodedText = decodeURIComponent(url.split('text=')[1])

      expect(decodedText).toContain('あと3名お願いします！')
    })

    it('テーマ名が30文字以上の場合、切り詰められる', () => {
      const longThemeBrainwriting: BrainwritingListItem = {
        ...mockBrainwriting,
        themeName: 'これは非常に長いテーマ名です。30文字を超えるとカットされるはずです。',
      }

      postBrainwritingToX({
        brainwriting: longThemeBrainwriting,
        isOwner: true,
      })

      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string
      const decodedText = decodeURIComponent(url.split('text=')[1])

      expect(decodedText).toContain('これは非常に長いテーマ名です。30文字を超えるとカットされる...')
    })
  })

  describe('postMandalartToX', () => {
    const mockMandalart: MandalartListItem = {
      id: 1,
      title: 'マンダラートタイトル',
      themeName: 'マンダラートテーマ',
      description: 'マンダラート説明',
      userId: 'user-123',
      publicToken: 'mandalart-token',
      isResultsPublic: true,
      createdAt: new Date('2024-01-01'),
    }

    it('マンダラートを投稿できる', () => {
      postMandalartToX({ mandalart: mockMandalart })

      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string

      const decodedText = decodeURIComponent(url.split('text=')[1])
      expect(decodedText).toContain('📊マンダラート')
      expect(decodedText).toContain('📝テーマ:マンダラートテーマ')
      expect(decodedText).toContain('アイデアを整理しました！')
      expect(decodedText).toContain('https://example.com/mandalart/mandalart-token')
      expect(decodedText).toContain('#アイデア研究所')
    })

    it('テーマ名が30文字以上の場合、切り詰められる', () => {
      const longThemeMandalart: MandalartListItem = {
        ...mockMandalart,
        themeName: 'これは非常に長いマンダラートのテーマ名です。30文字を超えるとカットされます。',
      }

      postMandalartToX({ mandalart: longThemeMandalart })

      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string
      const decodedText = decodeURIComponent(url.split('text=')[1])

      expect(decodedText).toContain('これは非常に長いマンダラートのテーマ名です。30文字を超える...')
    })
  })

  describe('postOsbornChecklistToX', () => {
    const mockOsbornChecklist: OsbornChecklistListItem = {
      id: 1,
      title: 'オズボーンタイトル',
      themeName: 'オズボーンテーマ',
      description: 'オズボーン説明',
      userId: 'user-123',
      publicToken: 'osborn-token',
      isResultsPublic: true,
      createdAt: new Date('2024-01-01'),
    }

    it('オズボーンのチェックリストを投稿できる', () => {
      postOsbornChecklistToX({ osbornChecklist: mockOsbornChecklist })

      expect(windowOpenSpy).toHaveBeenCalledTimes(1)
      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string

      const decodedText = decodeURIComponent(url.split('text=')[1])
      expect(decodedText).toContain('✅オズボーンのチェックリスト')
      expect(decodedText).toContain('📝テーマ:オズボーンテーマ')
      expect(decodedText).toContain('アイデアを整理しました！')
      expect(decodedText).toContain('https://example.com/osborn/osborn-token')
      expect(decodedText).toContain('#アイデア研究所')
    })

    it('テーマ名が30文字以上の場合、切り詰められる', () => {
      const longThemeOsborn: OsbornChecklistListItem = {
        ...mockOsbornChecklist,
        themeName: 'これは非常に長いオズボーンのチェックリストのテーマ名です。30文字を超えるとカットされます。',
      }

      postOsbornChecklistToX({ osbornChecklist: longThemeOsborn })

      const callArgs = windowOpenSpy.mock.calls[0]
      const url = callArgs[0] as string
      const decodedText = decodeURIComponent(url.split('text=')[1])

      expect(decodedText).toContain('これは非常に長いオズボーンのチェックリストのテーマ名です。3...')
    })
  })
})
