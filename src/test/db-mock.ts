/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'

/**
 * Drizzle ORM のモックヘルパー
 */
export const createMockDb = () => {
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()
  const mockTransaction = vi.fn()

  const db = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    transaction: mockTransaction,
  }

  return {
    db,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockTransaction,
  }
}

/**
 * チェーンメソッド用のモックビルダー
 */
export const createQueryChain = (returnValue: any) => {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(returnValue),
    returning: vi.fn().mockResolvedValue(returnValue),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  }

  // limit や returning が呼ばれない場合もあるので、チェーン自体も Promise として扱う
  Object.assign(chain, {
    then: (resolve: any) => resolve(returnValue),
  })

  return chain
}
