import { describe, it, expect } from 'vitest'
import {
  OSBORN_CHECKLIST_TYPES,
  OSBORN_CHECKLIST_NAMES,
  OSBORN_CHECKLIST_DESCRIPTIONS,
  OsbornChecklistType,
} from './osborn-checklist'

describe('OsbornChecklist Schema', () => {
  describe('OSBORN_CHECKLIST_TYPES', () => {
    it('9つのチェックリストタイプが定義されている', () => {
      const types = Object.keys(OSBORN_CHECKLIST_TYPES)
      expect(types).toHaveLength(9)
    })

    it('すべてのタイプが正しい値を持つ', () => {
      expect(OSBORN_CHECKLIST_TYPES.TRANSFER).toBe('transfer')
      expect(OSBORN_CHECKLIST_TYPES.APPLY).toBe('apply')
      expect(OSBORN_CHECKLIST_TYPES.MODIFY).toBe('modify')
      expect(OSBORN_CHECKLIST_TYPES.MAGNIFY).toBe('magnify')
      expect(OSBORN_CHECKLIST_TYPES.MINIFY).toBe('minify')
      expect(OSBORN_CHECKLIST_TYPES.SUBSTITUTE).toBe('substitute')
      expect(OSBORN_CHECKLIST_TYPES.REARRANGE).toBe('rearrange')
      expect(OSBORN_CHECKLIST_TYPES.REVERSE).toBe('reverse')
      expect(OSBORN_CHECKLIST_TYPES.COMBINE).toBe('combine')
    })
  })

  describe('OSBORN_CHECKLIST_NAMES', () => {
    it('すべてのタイプに対応する名前が定義されている', () => {
      const types = Object.values(OSBORN_CHECKLIST_TYPES) as OsbornChecklistType[]

      types.forEach((type) => {
        expect(OSBORN_CHECKLIST_NAMES[type]).toBeDefined()
        expect(typeof OSBORN_CHECKLIST_NAMES[type]).toBe('string')
        expect(OSBORN_CHECKLIST_NAMES[type].length).toBeGreaterThan(0)
      })
    })

    it('正しい日本語名が設定されている', () => {
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.TRANSFER]).toBe('転用')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.APPLY]).toBe('応用')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.MODIFY]).toBe('変更')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.MAGNIFY]).toBe('拡大')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.MINIFY]).toBe('縮小')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.SUBSTITUTE]).toBe('代用')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.REARRANGE]).toBe('再配置')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.REVERSE]).toBe('逆転')
      expect(OSBORN_CHECKLIST_NAMES[OSBORN_CHECKLIST_TYPES.COMBINE]).toBe('結合')
    })
  })

  describe('OSBORN_CHECKLIST_DESCRIPTIONS', () => {
    it('すべてのタイプに対応する説明が定義されている', () => {
      const types = Object.values(OSBORN_CHECKLIST_TYPES) as OsbornChecklistType[]

      types.forEach((type) => {
        expect(OSBORN_CHECKLIST_DESCRIPTIONS[type]).toBeDefined()
        expect(typeof OSBORN_CHECKLIST_DESCRIPTIONS[type]).toBe('string')
        expect(OSBORN_CHECKLIST_DESCRIPTIONS[type].length).toBeGreaterThan(0)
      })
    })

    it('各説明文に例が含まれている', () => {
      const types = Object.values(OSBORN_CHECKLIST_TYPES) as OsbornChecklistType[]

      types.forEach((type) => {
        const description = OSBORN_CHECKLIST_DESCRIPTIONS[type]
        expect(description).toContain('例：')
      })
    })

    it('転用の説明が正しい', () => {
      const description = OSBORN_CHECKLIST_DESCRIPTIONS[OSBORN_CHECKLIST_TYPES.TRANSFER]
      expect(description).toContain('転用')
      expect(description).toContain('例：')
    })
  })

  describe('マッピングの整合性', () => {
    it('TYPES, NAMES, DESCRIPTIONSのキーが一致する', () => {
      const typeValues = Object.values(OSBORN_CHECKLIST_TYPES)
      const nameKeys = Object.keys(OSBORN_CHECKLIST_NAMES)
      const descriptionKeys = Object.keys(OSBORN_CHECKLIST_DESCRIPTIONS)

      expect(typeValues.sort()).toEqual(nameKeys.sort())
      expect(typeValues.sort()).toEqual(descriptionKeys.sort())
    })

    it('すべてのタイプに名前と説明が存在する', () => {
      const types = Object.values(OSBORN_CHECKLIST_TYPES) as OsbornChecklistType[]

      types.forEach((type) => {
        expect(OSBORN_CHECKLIST_NAMES[type]).toBeDefined()
        expect(OSBORN_CHECKLIST_DESCRIPTIONS[type]).toBeDefined()
      })
    })
  })
})
