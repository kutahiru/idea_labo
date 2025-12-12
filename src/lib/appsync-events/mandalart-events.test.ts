import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishMandalartEvent } from './mandalart-events'
import { publishEvent } from './server'
import { NAMESPACES } from './namespaces'

// server をモック
vi.mock('./server', () => ({
  publishEvent: vi.fn(),
}))

describe('mandalart-events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publishMandalartEvent', () => {
    it('AI_GENERATION_COMPLETEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishMandalartEvent(1, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.MANDALART,
        channel: '/mandalart/1',
        data: {
          type: 'AI_GENERATION_COMPLETED',
        },
      })
    })

    it('AI_GENERATION_FAILEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishMandalartEvent(2, 'AI_GENERATION_FAILED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.MANDALART,
        channel: '/mandalart/2',
        data: {
          type: 'AI_GENERATION_FAILED',
        },
      })
    })

    it('エラーメッセージ付きでAI_GENERATION_FAILEDイベントを発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishMandalartEvent(1, 'AI_GENERATION_FAILED', 'テーマが適切ではありません')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.MANDALART,
        channel: '/mandalart/1',
        data: {
          type: 'AI_GENERATION_FAILED',
          errorMessage: 'テーマが適切ではありません',
        },
      })
    })

    it('異なるmandalartIdでチャンネルが変わる', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishMandalartEvent(100, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: '/mandalart/100',
        })
      )
    })

    it('namespaceがMANDALARTになっている', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishMandalartEvent(1, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'mandalart',
        })
      )
    })

    it('エラー発生時は例外をスローせずコンソールにログを出力する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(publishEvent).mockRejectedValueOnce(new Error('Network Error'))

      // エラーがスローされないことを確認
      await expect(
        publishMandalartEvent(1, 'AI_GENERATION_COMPLETED')
      ).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        'AppSync Eventsイベント発行エラー:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('エラー発生時でもundefinedを返す', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(publishEvent).mockRejectedValueOnce(new Error('Network Error'))

      const result = await publishMandalartEvent(1, 'AI_GENERATION_COMPLETED')

      expect(result).toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('正常終了時はundefinedを返す', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      const result = await publishMandalartEvent(1, 'AI_GENERATION_COMPLETED')

      expect(result).toBeUndefined()
    })
  })
})
