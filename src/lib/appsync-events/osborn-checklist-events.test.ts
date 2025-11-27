import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishOsbornChecklistEvent } from './osborn-checklist-events'
import { publishEvent } from './server'
import { NAMESPACES } from './namespaces'

// server をモック
vi.mock('./server', () => ({
  publishEvent: vi.fn(),
}))

describe('osborn-checklist-events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publishOsbornChecklistEvent', () => {
    it('AI_GENERATION_COMPLETEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishOsbornChecklistEvent(1, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.OSBORN,
        channel: '/osborn-checklist/1',
        data: {
          type: 'AI_GENERATION_COMPLETED',
        },
      })
    })

    it('AI_GENERATION_FAILEDイベントを正しく発行する', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishOsbornChecklistEvent(2, 'AI_GENERATION_FAILED')

      expect(publishEvent).toHaveBeenCalledWith({
        namespace: NAMESPACES.OSBORN,
        channel: '/osborn-checklist/2',
        data: {
          type: 'AI_GENERATION_FAILED',
        },
      })
    })

    it('異なるosbornChecklistIdでチャンネルが変わる', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishOsbornChecklistEvent(100, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: '/osborn-checklist/100',
        })
      )
    })

    it('namespaceがOSBORNになっている', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      await publishOsbornChecklistEvent(1, 'AI_GENERATION_COMPLETED')

      expect(publishEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'osborn',
        })
      )
    })

    it('エラー発生時は例外をスローせずコンソールにログを出力する', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(publishEvent).mockRejectedValueOnce(new Error('Network Error'))

      // エラーがスローされないことを確認
      await expect(
        publishOsbornChecklistEvent(1, 'AI_GENERATION_COMPLETED')
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

      const result = await publishOsbornChecklistEvent(1, 'AI_GENERATION_COMPLETED')

      expect(result).toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('正常終了時はundefinedを返す', async () => {
      vi.mocked(publishEvent).mockResolvedValueOnce({ success: true })

      const result = await publishOsbornChecklistEvent(1, 'AI_GENERATION_COMPLETED')

      expect(result).toBeUndefined()
    })
  })
})
