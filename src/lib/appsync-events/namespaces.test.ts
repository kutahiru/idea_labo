import { describe, it, expect } from 'vitest'
import { NAMESPACES, type Namespace } from './namespaces'

describe('namespaces', () => {
  describe('NAMESPACES', () => {
    it('BRAINWRITINGが定義されている', () => {
      expect(NAMESPACES.BRAINWRITING).toBe('brainwriting')
    })

    it('MANDALAが定義されている', () => {
      expect(NAMESPACES.MANDALA).toBe('mandala')
    })

    it('OSBORNが定義されている', () => {
      expect(NAMESPACES.OSBORN).toBe('osborn')
    })

    it('すべての名前空間が文字列である', () => {
      Object.values(NAMESPACES).forEach((value) => {
        expect(typeof value).toBe('string')
      })
    })

    it('名前空間は3種類ある', () => {
      expect(Object.keys(NAMESPACES)).toHaveLength(3)
    })

    it('名前空間はすべて小文字である', () => {
      Object.values(NAMESPACES).forEach((value) => {
        expect(value).toBe(value.toLowerCase())
      })
    })
  })

  describe('Namespace型', () => {
    it('有効な名前空間値が型に適合する', () => {
      const brainwriting: Namespace = 'brainwriting'
      const mandala: Namespace = 'mandala'
      const osborn: Namespace = 'osborn'

      expect(brainwriting).toBe('brainwriting')
      expect(mandala).toBe('mandala')
      expect(osborn).toBe('osborn')
    })
  })
})
