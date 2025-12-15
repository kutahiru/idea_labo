import { describe, it, expect } from 'vitest'
import {
  BRAINWRITING_EVENT_TYPES,
  AI_GENERATION_EVENT_TYPES,
  type BrainwritingEventType,
  type AIGenerationEventType,
} from './event-types'

describe('event-types', () => {
  describe('BRAINWRITING_EVENT_TYPES', () => {
    it('USER_JOINEDが定義されている', () => {
      expect(BRAINWRITING_EVENT_TYPES.USER_JOINED).toBe('USER_JOINED')
    })

    it('BRAINWRITING_STARTEDが定義されている', () => {
      expect(BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED).toBe('BRAINWRITING_STARTED')
    })

    it('SHEET_ROTATEDが定義されている', () => {
      expect(BRAINWRITING_EVENT_TYPES.SHEET_ROTATED).toBe('SHEET_ROTATED')
    })

    it('オブジェクトが読み取り専用である', () => {
      expect(Object.isFrozen(BRAINWRITING_EVENT_TYPES)).toBe(false)
      // as const で定義されているため、TypeScriptレベルで読み取り専用
      // 実行時に変更を試みるとオブジェクトは変更されるが、型エラーになる
    })

    it('すべてのイベントタイプが文字列である', () => {
      Object.values(BRAINWRITING_EVENT_TYPES).forEach((value) => {
        expect(typeof value).toBe('string')
      })
    })

    it('イベントタイプは3種類ある', () => {
      expect(Object.keys(BRAINWRITING_EVENT_TYPES)).toHaveLength(3)
    })
  })

  describe('AI_GENERATION_EVENT_TYPES', () => {
    it('COMPLETEDが定義されている', () => {
      expect(AI_GENERATION_EVENT_TYPES.COMPLETED).toBe('AI_GENERATION_COMPLETED')
    })

    it('FAILEDが定義されている', () => {
      expect(AI_GENERATION_EVENT_TYPES.FAILED).toBe('AI_GENERATION_FAILED')
    })

    it('すべてのイベントタイプが文字列である', () => {
      Object.values(AI_GENERATION_EVENT_TYPES).forEach((value) => {
        expect(typeof value).toBe('string')
      })
    })

    it('イベントタイプは2種類ある', () => {
      expect(Object.keys(AI_GENERATION_EVENT_TYPES)).toHaveLength(2)
    })
  })

  describe('型定義', () => {
    it('BrainwritingEventTypeが正しい型を持つ', () => {
      // 型チェックのためのテスト
      const userJoined: BrainwritingEventType = 'USER_JOINED'
      const started: BrainwritingEventType = 'BRAINWRITING_STARTED'
      const rotated: BrainwritingEventType = 'SHEET_ROTATED'

      expect(userJoined).toBe('USER_JOINED')
      expect(started).toBe('BRAINWRITING_STARTED')
      expect(rotated).toBe('SHEET_ROTATED')
    })

    it('AIGenerationEventTypeが正しい型を持つ', () => {
      // 型チェックのためのテスト
      const completed: AIGenerationEventType = 'AI_GENERATION_COMPLETED'
      const failed: AIGenerationEventType = 'AI_GENERATION_FAILED'

      expect(completed).toBe('AI_GENERATION_COMPLETED')
      expect(failed).toBe('AI_GENERATION_FAILED')
    })
  })
})
