import { describe, it, expect, vi } from 'vitest'
import { parseJsonSafe, parseJson } from './client-utils'

describe('Client Utils', () => {
  describe('parseJsonSafe', () => {
    it('正常なJSONレスポンスをパースできる', async () => {
      const mockData = { id: 1, name: 'テスト' }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response

      const result = await parseJsonSafe(mockResponse, {})

      expect(result).toEqual(mockData)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('JSONパースエラー時にデフォルト値を返す', async () => {
      const defaultValue = { error: 'default' }
      const mockResponse = {
        json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
      } as unknown as Response

      const result = await parseJsonSafe(mockResponse, defaultValue)

      expect(result).toEqual(defaultValue)
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })

  describe('parseJson', () => {
    it('正常なJSONレスポンスをパースできる', async () => {
      const mockData = { id: 1, name: 'テスト' }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockData),
      } as unknown as Response

      const result = await parseJson(mockResponse)

      expect(result).toEqual(mockData)
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('JSONパースエラー時にエラーをスローする', async () => {
      const mockResponse = {
        json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
      } as unknown as Response

      await expect(parseJson(mockResponse)).rejects.toThrow('データの読み込みに失敗しました')
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('カスタムエラーメッセージでエラーをスローする', async () => {
      const customErrorMessage = 'カスタムエラー'
      const mockResponse = {
        json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
      } as unknown as Response

      await expect(parseJson(mockResponse, customErrorMessage)).rejects.toThrow(customErrorMessage)
      expect(mockResponse.json).toHaveBeenCalled()
    })
  })
})
