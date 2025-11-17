import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  generateToken,
  generateInviteToken,
  generateInviteUrl,
  generateInviteData,
  generateMandalartPublicUrl,
  generateOsbornChecklistPublicUrl,
} from './token'

describe('Token Utils', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL

  beforeEach(() => {
    // 環境変数をクリア
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  afterEach(() => {
    // 環境変数を復元
    if (originalEnv) {
      process.env.NEXT_PUBLIC_APP_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_APP_URL
    }
  })

  describe('generateToken', () => {
    it('32文字の16進数文字列を生成する', () => {
      const token = generateToken()

      expect(token).toHaveLength(32)
      expect(token).toMatch(/^[0-9a-f]{32}$/)
    })

    it('呼び出すたびに異なるトークンを生成する', () => {
      const token1 = generateToken()
      const token2 = generateToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('generateInviteToken', () => {
    it('32文字の16進数文字列を生成する', () => {
      const token = generateInviteToken()

      expect(token).toHaveLength(32)
      expect(token).toMatch(/^[0-9a-f]{32}$/)
    })

    it('呼び出すたびに異なるトークンを生成する', () => {
      const token1 = generateInviteToken()
      const token2 = generateInviteToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('generateInviteUrl', () => {
    it('トークンから招待URLを生成できる（デフォルトURL）', () => {
      const token = 'test-token-123'
      const url = generateInviteUrl(token)

      expect(url).toBe('http://localhost:3000/brainwritings/invite/test-token-123')
    })

    it('トークンから招待URLを生成できる（カスタムURL）', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const token = 'test-token-456'
      const url = generateInviteUrl(token)

      expect(url).toBe('https://example.com/brainwritings/invite/test-token-456')
    })

    it('トークンがnullの場合、エラーをスローする', () => {
      expect(() => generateInviteUrl(null)).toThrow('Invite token is required')
    })

    it('トークンがundefinedの場合、エラーをスローする', () => {
      expect(() => generateInviteUrl(undefined)).toThrow('Invite token is required')
    })

    it('トークンが空文字列の場合、エラーをスローする', () => {
      expect(() => generateInviteUrl('')).toThrow('Invite token is required')
    })
  })

  describe('generateInviteData', () => {
    it('トークンとURLの両方を生成できる', () => {
      const data = generateInviteData()

      expect(data).toHaveProperty('token')
      expect(data).toHaveProperty('url')
      expect(data.token).toHaveLength(32)
      expect(data.token).toMatch(/^[0-9a-f]{32}$/)
      expect(data.url).toContain(data.token)
      expect(data.url).toContain('/brainwritings/invite/')
    })
  })

  describe('generateMandalartPublicUrl', () => {
    it('トークンからマンダラート公開URLを生成できる（デフォルトURL）', () => {
      const token = 'mandalart-token-123'
      const url = generateMandalartPublicUrl(token)

      expect(url).toBe('http://localhost:3000/mandalarts/public/mandalart-token-123')
    })

    it('トークンからマンダラート公開URLを生成できる（カスタムURL）', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const token = 'mandalart-token-456'
      const url = generateMandalartPublicUrl(token)

      expect(url).toBe('https://example.com/mandalarts/public/mandalart-token-456')
    })

    it('トークンがnullの場合、エラーをスローする', () => {
      expect(() => generateMandalartPublicUrl(null)).toThrow('Public token is required')
    })

    it('トークンがundefinedの場合、エラーをスローする', () => {
      expect(() => generateMandalartPublicUrl(undefined)).toThrow('Public token is required')
    })

    it('トークンが空文字列の場合、エラーをスローする', () => {
      expect(() => generateMandalartPublicUrl('')).toThrow('Public token is required')
    })
  })

  describe('generateOsbornChecklistPublicUrl', () => {
    it('トークンからオズボーンのチェックリスト公開URLを生成できる（デフォルトURL）', () => {
      const token = 'osborn-token-123'
      const url = generateOsbornChecklistPublicUrl(token)

      expect(url).toBe('http://localhost:3000/osborn-checklists/public/osborn-token-123')
    })

    it('トークンからオズボーンのチェックリスト公開URLを生成できる（カスタムURL）', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
      const token = 'osborn-token-456'
      const url = generateOsbornChecklistPublicUrl(token)

      expect(url).toBe('https://example.com/osborn-checklists/public/osborn-token-456')
    })

    it('トークンがnullの場合、エラーをスローする', () => {
      expect(() => generateOsbornChecklistPublicUrl(null)).toThrow('Public token is required')
    })

    it('トークンがundefinedの場合、エラーをスローする', () => {
      expect(() => generateOsbornChecklistPublicUrl(undefined)).toThrow('Public token is required')
    })

    it('トークンが空文字列の場合、エラーをスローする', () => {
      expect(() => generateOsbornChecklistPublicUrl('')).toThrow('Public token is required')
    })
  })
})
