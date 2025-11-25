import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishBrainwritingEvent } from './brainwriting-events'
import { publishEvent } from './server'
import { NAMESPACES } from './namespaces'

// server をモック
vi.mock('./server', () => ({
  publishEvent: vi.fn(),
}))

describe('brainwriting-events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publishBrainwritingEvent', () => {
    it('USER_JOINEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishBrainwritingEvent(1, 'USER_JOINED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.BRAINWRITING,
        channel: '/brainwriting/1',
        data: {
          type: 'USER_JOINED',
        },
      })
    })

    it('BRAINWRITING_STARTEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishBrainwritingEvent(2, 'BRAINWRITING_STARTED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.BRAINWRITING,
        channel: '/brainwriting/2',
        data: {
          type: 'BRAINWRITING_STARTED',
        },
      })
    })

    it('SHEET_ROTATEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishBrainwritingEvent(3, 'SHEET_ROTATED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.BRAINWRITING,
        channel: '/brainwriting/3',
        data: {
          type: 'SHEET_ROTATED',
        },
      })
    })

    it('異なるbrainwritingIdでチャンネルが変わる', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishBrainwritingEvent(100, 'USER_JOINED')

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: '/brainwriting/100',
        })
      )
    })

    it('エラー発生時は例外をスローせずコンソールにログを出力する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(publishEvent).mockRejectedValueOnce(new Error('Network Error'))

      // エラーがスローされないことを確認
      await expect(publishBrainwritingEvent(1, 'USER_JOINED')).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        'AppSync Eventsイベント発行エラー:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('エラー発生時でもundefinedを返す', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(publishEvent).mockRejectedValueOnce(new Error('Network Error'))

      const result = await publishBrainwritingEvent(1, 'USER_JOINED')

      expect(result).toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('正常終了時はundefinedを返す', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      const result = await publishBrainwritingEvent(1, 'USER_JOINED')

      expect(result).toBeUndefined()
    })
  })
})
