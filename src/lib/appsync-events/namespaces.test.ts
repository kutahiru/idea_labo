import { describe, it, expect } from 'vitest'
import { NAMESPACES, type Namespace } from './namespaces'

describe('namespaces', () => {
  describe('NAMESPACES', () => {
    it('BRAINWRITINGが定義されている', () => {
      expect(NAMESPACES.BRAINWRITING).toBe('brainwriting')
    })

    it('MANDALARTが定義されている', () => {
      expect(NAMESPACES.MANDALART).toBe('mandalart')
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
      const mandalart: Namespace = 'mandalart'
      const osborn: Namespace = 'osborn'

      expect(brainwriting).toBe('brainwriting')
      expect(mandalart).toBe('mandalart')
      expect(osborn).toBe('osborn')
    })
  })
})
