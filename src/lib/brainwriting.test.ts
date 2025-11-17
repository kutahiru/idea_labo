/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as brainwritingLib from "./brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// データベースをモック
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    selectDistinct: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

// トークン生成関数をモック
vi.mock("./token", () => ({
  generateToken: vi.fn(() => "mock-token-123"),
}));

import { db } from "@/db";

describe("Brainwriting Data Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBrainwritingsByUserId", () => {
    it("ユーザーIDに紐づくブレインライティング一覧を取得できる", async () => {
      const mockBrainwritings = [
        {
          id: 1,
          userId: "user-123",
          title: "ブレインライティング1",
          themeName: "テーマ1",
          description: "説明1",
          usageScope: "xpost",
          createdAt: new Date("2024-01-01"),
        },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockBrainwritings),
      };

      // db.select() がモックチェーンを返すように設定
      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingsByUserId("user-123");

      //db.select が呼ばれたかの確認
      expect(db.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.orderBy).toHaveBeenCalled();
      expect(result).toEqual(mockBrainwritings);
    });
  });

  describe("createBrainwriting", () => {
    it("X投稿版のブレインライティングを作成できる", async () => {
      const mockData = {
        title: "新しいブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
      };

      const mockResult = {
        id: 1,
        title: "新しいブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        createdAt: new Date(),
      };

      const mockTransaction = vi.fn(async (callback: any) => {
        const mockTx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockResult]),
            }),
          }),
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
        return await callback(mockTx);
      });

      vi.mocked(db.transaction).mockImplementation(mockTransaction);

      const result = await brainwritingLib.createBrainwriting("user-123", mockData);

      expect(db.transaction).toHaveBeenCalled();
      expect(result).toMatchObject({
        title: mockData.title,
        themeName: mockData.themeName,
        usageScope: mockData.usageScope,
      });
    });
  });

  describe("updateBrainwriting", () => {
    it("ブレインライティングを更新できる", async () => {
      const mockUpdateData = {
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: USAGE_SCOPE.TEAM,
      };

      const mockResult = {
        id: 1,
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: USAGE_SCOPE.TEAM,
        createdAt: new Date(),
      };

      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      };

      vi.mocked(db.update).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.updateBrainwriting(1, "user-123", mockUpdateData);

      expect(db.update).toHaveBeenCalled();
      expect(mockChain.set).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("deleteBrainwriting", () => {
    it("ブレインライティングを削除できる", async () => {
      const mockResult = { id: 1 };

      const mockChain = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      };

      vi.mocked(db.delete).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.deleteBrainwriting(1, "user-123");

      expect(db.delete).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("getBrainwritingById", () => {
    it("ブレインライティングの詳細を取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "mock-token-123",
        isInviteActive: true,
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingById(1, "user-123");

      expect(db.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBrainwriting);
    });
  });

  describe("checkJoinStatus", () => {
    it("参加している場合、isJoinedがtrueを返す", async () => {
      const mockJoinData = [
        {
          id: 1,
          brainwriting_id: 1,
          user_id: "user-123",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockJoinData),
      };

      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([{ id: 1 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelectChain as any)
        .mockReturnValueOnce(mockSheetChain as any);

      const result = await brainwritingLib.checkJoinStatus(1, "user-123");

      expect(result.isJoined).toBe(true);
      expect(result.joinData).toEqual(mockJoinData[0]);
    });

    it("参加していない場合、isJoinedがfalseを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkJoinStatus(1, "user-456");

      expect(result.isJoined).toBe(false);
      expect(result.joinData).toBeNull();
    });
  });

  describe("checkUserCount", () => {
    it("現在の参加人数と満員フラグを返す", async () => {
      const mockUsers = [
        { id: 1, user_id: "user-1" },
        { id: 2, user_id: "user-2" },
        { id: 3, user_id: "user-3" },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkUserCount(1);

      expect(result.currentCount).toBe(3);
      expect(result.maxCount).toBe(6);
      expect(result.isFull).toBe(false);
    });

    it("満員の場合、isFullがtrueを返す", async () => {
      const mockUsers = [
        { id: 1, user_id: "user-1" },
        { id: 2, user_id: "user-2" },
        { id: 3, user_id: "user-3" },
        { id: 4, user_id: "user-4" },
        { id: 5, user_id: "user-5" },
        { id: 6, user_id: "user-6" },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkUserCount(1);

      expect(result.currentCount).toBe(6);
      expect(result.isFull).toBe(true);
    });
  });

  describe("upsertBrainwritingInput", () => {
    it("新規の入力データを作成できる", async () => {
      const mockInput = {
        id: 1,
        brainwriting_id: 1,
        brainwriting_sheet_id: 1,
        input_user_id: "user-123",
        row_index: 0,
        column_index: 0,
        content: "テストアイデア",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      const mockInsertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockInput]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      const result = await brainwritingLib.upsertBrainwritingInput(
        1,
        1,
        "user-123",
        0,
        0,
        "テストアイデア"
      );

      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockInput);
    });

    it("既存の入力データを更新できる", async () => {
      const existingInput = {
        id: 1,
        brainwriting_id: 1,
        brainwriting_sheet_id: 1,
        input_user_id: "user-123",
        row_index: 0,
        column_index: 0,
        content: "古いアイデア",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedInput = {
        ...existingInput,
        content: "新しいアイデア",
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([existingInput]),
      };

      const mockUpdateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedInput]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const result = await brainwritingLib.upsertBrainwritingInput(
        1,
        1,
        "user-123",
        0,
        0,
        "新しいアイデア"
      );

      expect(db.update).toHaveBeenCalled();
      expect(result).toEqual(updatedInput);
    });

    it("空文字の場合、nullに変換して保存する", async () => {
      const mockInput = {
        id: 1,
        brainwriting_id: 1,
        brainwriting_sheet_id: 1,
        input_user_id: "user-123",
        row_index: 0,
        column_index: 0,
        content: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      const mockInsertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockInput]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelectChain as any);
      vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

      await brainwritingLib.upsertBrainwritingInput(1, 1, "user-123", 0, 0, "   ");

      expect(mockInsertChain.values).toHaveBeenCalledWith(
        expect.objectContaining({
          content: null,
        })
      );
    });
  });

  describe("getBrainwritingByToken", () => {
    it("トークンでブレインライティングを取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "test-token-123",
        isInviteActive: true,
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingByToken("test-token-123");

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockBrainwriting);
    });

    it("トークンが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingByToken("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("updateBrainwritingIsInviteActive", () => {
    it("招待URLの有効状態を更新できる", async () => {
      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.update).mockReturnValue(mockChain as any);

      await brainwritingLib.updateBrainwritingIsInviteActive(1, "user-123", false);

      expect(db.update).toHaveBeenCalled();
      expect(mockChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          is_invite_active: false,
        })
      );
      expect(mockChain.where).toHaveBeenCalled();
    });
  });

  describe("updateBrainwritingIsResultsPublic", () => {
    it("結果公開の状態を更新できる", async () => {
      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.update).mockReturnValue(mockChain as any);

      await brainwritingLib.updateBrainwritingIsResultsPublic(1, "user-123", true);

      expect(db.update).toHaveBeenCalled();
      expect(mockChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          is_results_public: true,
        })
      );
      expect(mockChain.where).toHaveBeenCalled();
    });
  });

  describe("getBrainwritingUsersByBrainwritingId", () => {
    it("参加者一覧を取得できる", async () => {
      const mockUsers = [
        {
          id: 1,
          brainwriting_id: 1,
          user_id: "user-1",
          user_name: "ユーザー1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          brainwriting_id: 1,
          user_id: "user-2",
          user_name: "ユーザー2",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingUsersByBrainwritingId(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe("unlockSheet", () => {
    it("シートのロックを解除できる", async () => {
      const mockChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.update).mockReturnValue(mockChain as any);

      await brainwritingLib.unlockSheet(1, "user-123");

      expect(db.update).toHaveBeenCalled();
      expect(mockChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          current_user_id: null,
          lock_expires_at: null,
        })
      );
      expect(mockChain.where).toHaveBeenCalled();
    });
  });

  describe("checkTeamJoinable", () => {
    it("シートが存在しない場合、参加可能を返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkTeamJoinable(1, "user-123");

      expect(result.canJoin).toBe(true);
    });

    it("シートが存在し、参加者に含まれる場合、参加可能を返す", async () => {
      const mockSheets = [{ id: 1 }];
      const mockUsers = [{ id: 1, brainwriting_id: 1, user_id: "user-123" }];

      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      const mockUserChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockUserChain as any);

      const result = await brainwritingLib.checkTeamJoinable(1, "user-123");

      expect(result.canJoin).toBe(true);
    });

    it("シートが存在し、参加者に含まれない場合、参加不可を返す", async () => {
      const mockSheets = [{ id: 1 }];

      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      const mockUserChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockUserChain as any);

      const result = await brainwritingLib.checkTeamJoinable(1, "user-456");

      expect(result.canJoin).toBe(false);
    });
  });

  describe("getBrainwritingSheetsByBrainwritingId", () => {
    it("シート一覧を取得できる", async () => {
      const mockSheets = [
        {
          id: 1,
          brainwriting_id: 1,
          current_user_id: "user-1",
          lock_expires_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingSheetsByBrainwritingId(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockSheets);
    });
  });

  describe("getBrainwritingSheetById", () => {
    it("シートを取得できる", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-1",
        lock_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingSheetById(1);

      expect(result).toEqual(mockSheet);
    });

    it("シートが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingSheetById(999);

      expect(result).toBeNull();
    });
  });

  describe("getBrainwritingInputsBySheetId", () => {
    it("シート別の入力データを取得できる", async () => {
      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-1",
          input_user_name: "ユーザー1",
          row_index: 0,
          column_index: 0,
          content: "アイデア1",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingInputsBySheetId(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockInputs);
    });
  });

  describe("getBrainwritingInputsByBrainwritingId", () => {
    it("ブレインライティング別の入力データを取得できる", async () => {
      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-1",
          input_user_name: "ユーザー1",
          row_index: 0,
          column_index: 0,
          content: "アイデア1",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingInputsByBrainwritingId(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockInputs);
    });
  });

  describe("checkSheetLockStatus", () => {
    it("ロックされていない場合、isLockedがfalseを返す", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: null,
        lock_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkSheetLockStatus(1, "user-123");

      expect(result.isLocked).toBe(false);
      expect(result.lockExpiresAt).toBeNull();
    });

    it("他のユーザーがロックしている場合、isLockedがtrueを返す", async () => {
      const futureDate = new Date(Date.now() + 60000);
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-456",
        lock_expires_at: futureDate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkSheetLockStatus(1, "user-123");

      expect(result.isLocked).toBe(true);
      expect(result.lockExpiresAt).toEqual(futureDate);
    });

    it("ロック期限が切れている場合、isLockedがfalseを返す", async () => {
      const pastDate = new Date(Date.now() - 60000);
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-456",
        lock_expires_at: pastDate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkSheetLockStatus(1, "user-123");

      expect(result.isLocked).toBe(false);
    });

    it("自分がロックしている場合、isLockedがfalseを返す", async () => {
      const futureDate = new Date(Date.now() + 60000);
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-123",
        lock_expires_at: futureDate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.checkSheetLockStatus(1, "user-123");

      expect(result.isLocked).toBe(false);
    });
  });

  describe("getBrainwritingByIdInternal", () => {
    it("権限チェックなしでブレインライティングを取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "mock-token-123",
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingByIdInternal(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockBrainwriting);
    });
  });

  describe("getBrainwritingSheetWithBrainwriting", () => {
    it("シートとブレインライティング情報を結合して取得できる", async () => {
      const mockResult = {
        sheet: {
          id: 1,
          brainwriting_id: 1,
          current_user_id: "user-1",
          lock_expires_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        brainwriting: {
          id: 1,
          usageScope: USAGE_SCOPE.XPOST,
        },
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockResult]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingSheetWithBrainwriting(1);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("シートが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingSheetWithBrainwriting(999);

      expect(result).toBeNull();
    });
  });

  describe("getBrainwritingDetailById", () => {
    it("ブレインライティングの詳細情報を取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "mock-token-123",
        isInviteActive: true,
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-123", user_name: "テストユーザー" },
      ];

      const mockSheets = [
        { id: 1, brainwriting_id: 1, current_user_id: null, lock_expires_at: null },
      ];

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-123",
          row_index: 0,
          column_index: 0,
          content: "テスト入力",
        },
      ];

      // getBrainwritingById のモック
      const mockBrainwritingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      // getBrainwritingUsersByBrainwritingId のモック
      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      // getBrainwritingSheetsByBrainwritingId のモック
      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      // getBrainwritingInputsByBrainwritingId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockBrainwritingChain as any)
        .mockReturnValueOnce(mockUsersChain as any)
        .mockReturnValueOnce(mockSheetsChain as any)
        .mockReturnValueOnce(mockInputsChain as any);

      const result = await brainwritingLib.getBrainwritingDetailById(1, "user-123");

      expect(result).toEqual({
        ...mockBrainwriting,
        sheets: mockSheets,
        inputs: mockInputs,
        users: mockUsers,
      });
    });

    it("ブレインライティングが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingDetailById(999, "user-123");

      expect(result).toBeNull();
    });
  });

  describe("getBrainwritingDetailForBrainwritingUser", () => {
    it("ブレインライティング参加者用の詳細情報を取得できる", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: null,
        lock_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockJoinData = [
        {
          id: 1,
          brainwriting_id: 1,
          user_id: "user-123",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "mock-token-123",
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-123",
          input_user_name: "テストユーザー",
          row_index: 0,
          column_index: 0,
          content: "テスト入力",
        },
      ];

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-123", user_name: "テストユーザー" },
      ];

      const mockSheets = [mockSheet];

      // getBrainwritingSheetById のモック
      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      // checkJoinStatus のモック（getBrainwritingSheetByIdの次）
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockJoinData),
      };

      // checkJoinStatus内のgetBrainwritingSheetsByBrainwritingId のモック
      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      // getBrainwritingByIdInternal のモック
      const mockBrainwritingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      // getBrainwritingInputsBySheetId のモック
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      // getBrainwritingUsersByBrainwritingId のモック
      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockJoinStatusChain as any)
        .mockReturnValueOnce(mockSheetsChain as any) // checkJoinStatus内のgetBrainwritingSheetsByBrainwritingId
        .mockReturnValueOnce(mockBrainwritingChain as any)
        .mockReturnValueOnce(mockInputsChain as any)
        .mockReturnValueOnce(mockUsersChain as any);

      const result = await brainwritingLib.getBrainwritingDetailForBrainwritingUser(1, "user-123");

      expect(result).toEqual({
        ...mockBrainwriting,
        sheets: [mockSheet],
        inputs: mockInputs,
        users: mockUsers,
      });
    });

    it("シートが存在しない場合、nullを返す", async () => {
      // getBrainwritingSheetById - シートが存在しない
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingDetailForBrainwritingUser(
        999,
        "user-123"
      );

      expect(result).toBeNull();
    });

    it("参加していない場合、nullを返す", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: null,
        lock_expires_at: null,
      };

      // getBrainwritingSheetById
      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      // checkJoinStatus - 参加していない
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockJoinStatusChain as any);

      const result = await brainwritingLib.getBrainwritingDetailForBrainwritingUser(1, "user-456");

      expect(result).toBeNull();
    });
  });

  describe("getBrainwritingResultsById", () => {
    it("公開設定されている場合、結果を取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.XPOST,
        inviteToken: "mock-token-123",
        isResultsPublic: true, // 公開設定
        createdAt: new Date(),
      };

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-123", user_name: "テストユーザー" },
      ];

      const mockSheets = [
        { id: 1, brainwriting_id: 1, current_user_id: null, lock_expires_at: null },
      ];

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-123",
          row_index: 0,
          column_index: 0,
          content: "テスト入力",
        },
      ];

      // getBrainwritingByIdInternal
      const mockBrainwritingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      // getBrainwritingUsersByBrainwritingId
      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      // getBrainwritingSheetsByBrainwritingId
      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      // getBrainwritingInputsByBrainwritingId
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockBrainwritingChain as any)
        .mockReturnValueOnce(mockUsersChain as any)
        .mockReturnValueOnce(mockSheetsChain as any)
        .mockReturnValueOnce(mockInputsChain as any);

      const result = await brainwritingLib.getBrainwritingResultsById(1);

      expect(result).toEqual({
        ...mockBrainwriting,
        sheets: mockSheets,
        inputs: mockInputs,
        users: mockUsers,
      });
    });

    it("公開設定されていない場合、nullを返す", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        isResultsPublic: false, // 非公開設定
      };

      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingResultsById(1);

      expect(result).toBeNull();
    });

    it("ブレインライティングが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingResultsById(999);

      expect(result).toBeNull();
    });
  });

  describe("getBrainwritingTeamByBrainwritingId", () => {
    it("チーム用のブレインライティング情報を取得できる", async () => {
      const mockBrainwriting = {
        id: 1,
        userId: "user-123",
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: USAGE_SCOPE.TEAM,
        inviteToken: "mock-token-123",
        isResultsPublic: false,
        createdAt: new Date(),
      };

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-123", user_name: "テストユーザー1" },
        { id: 2, brainwriting_id: 1, user_id: "user-456", user_name: "テストユーザー2" },
      ];

      const mockSheets = [
        { id: 1, brainwriting_id: 1, current_user_id: "user-123", lock_expires_at: null },
        { id: 2, brainwriting_id: 1, current_user_id: "user-456", lock_expires_at: null },
      ];

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-123",
          row_index: 0,
          column_index: 0,
          content: "テスト入力1",
        },
        {
          id: 2,
          brainwriting_id: 1,
          brainwriting_sheet_id: 2,
          input_user_id: "user-456",
          row_index: 0,
          column_index: 0,
          content: "テスト入力2",
        },
      ];

      const mockBrainwritingChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockBrainwriting]),
      };

      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockBrainwritingChain as any)
        .mockReturnValueOnce(mockUsersChain as any)
        .mockReturnValueOnce(mockSheetsChain as any)
        .mockReturnValueOnce(mockInputsChain as any);

      const result = await brainwritingLib.getBrainwritingTeamByBrainwritingId(1);

      expect(result).toEqual({
        ...mockBrainwriting,
        sheets: mockSheets,
        inputs: mockInputs,
        users: mockUsers,
      });
    });

    it("ブレインライティングが存在しない場合、nullを返す", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      const result = await brainwritingLib.getBrainwritingTeamByBrainwritingId(999);

      expect(result).toBeNull();
    });
  });

  describe("joinBrainwriting", () => {
    it("XPOST版でブレインライティングに参加できる", async () => {
      const mockJoinResult = {
        id: 1,
        brainwriting_id: 1,
        user_id: "user-123",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSheetResult = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-123",
        lock_expires_at: new Date(Date.now() + 600000),
      };

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-123", user_name: "テストユーザー" },
      ];

      // checkJoinStatus - 未参加
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // checkUserCount - 満員でない
      const mockUserCountChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}, {}]), // 2人参加済み
      };

      // checkSheetLockStatus - ロックされていない
      const mockSheetLockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, current_user_id: null, lock_expires_at: null }]),
      };

      // insert brainwriting_users
      const mockInsertChain = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockJoinResult]),
      };

      // update brainwriting_sheets
      const mockUpdateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockSheetResult]),
      };

      // getBrainwritingUsersByBrainwritingId
      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      // insert brainwriting_inputs
      const mockInputInsertChain = {
        values: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockJoinStatusChain as any) // checkJoinStatus
        .mockReturnValueOnce(mockUserCountChain as any) // checkUserCount
        .mockReturnValueOnce(mockSheetLockChain as any) // checkSheetLockStatus
        .mockReturnValueOnce(mockUsersChain as any); // getBrainwritingUsersByBrainwritingId

      vi.mocked(db.insert)
        .mockReturnValueOnce(mockInsertChain as any) // brainwriting_users
        .mockReturnValueOnce(mockInputInsertChain as any); // brainwriting_inputs

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const result = await brainwritingLib.joinBrainwriting(1, "user-123", USAGE_SCOPE.XPOST);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJoinResult);
      expect(result.sheetId).toBe(1);
    });

    it("既に参加済みの場合、エラーをスローする", async () => {
      const mockJoinData = [{ id: 1, brainwriting_id: 1, user_id: "user-123" }];
      const mockSheets = [{ id: 1 }];

      // checkJoinStatus - 参加済み
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockJoinData),
      };

      // checkJoinStatus内のgetBrainwritingSheetsByBrainwritingId
      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockSheets),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockJoinStatusChain as any)
        .mockReturnValueOnce(mockSheetsChain as any);

      await expect(
        brainwritingLib.joinBrainwriting(1, "user-123", USAGE_SCOPE.XPOST)
      ).rejects.toThrow("既に参加しています");
    });

    it("満員の場合、エラーをスローする", async () => {
      // checkJoinStatus - 未参加
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // checkUserCount - 満員
      const mockUserCountChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}, {}, {}, {}, {}, {}]), // 6人参加済み
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockJoinStatusChain as any)
        .mockReturnValueOnce(mockUserCountChain as any);

      await expect(
        brainwritingLib.joinBrainwriting(1, "user-123", USAGE_SCOPE.XPOST)
      ).rejects.toThrow("参加人数が上限に達しています");
    });

    it("XPOST版でロック中の場合、エラーをスローする", async () => {
      const futureDate = new Date(Date.now() + 60000);

      // checkJoinStatus - 未参加
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // checkUserCount - 満員でない
      const mockUserCountChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}]),
      };

      // checkSheetLockStatus - ロックされている
      const mockSheetLockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            current_user_id: "user-456",
            lock_expires_at: futureDate,
          },
        ]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockJoinStatusChain as any)
        .mockReturnValueOnce(mockUserCountChain as any)
        .mockReturnValueOnce(mockSheetLockChain as any);

      await expect(
        brainwritingLib.joinBrainwriting(1, "user-123", USAGE_SCOPE.XPOST)
      ).rejects.toThrow("他の方が編集中です");
    });

    it("TEAM版でシート作成後に参加できない場合、エラーをスローする", async () => {
      // checkJoinStatus - 未参加
      const mockJoinStatusChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // checkUserCount - 満員でない
      const mockUserCountChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{}]),
      };

      // checkTeamJoinable - シートが存在し、参加者でない
      const mockSheetsChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([{ id: 1 }]), // シートが存在
      };

      const mockTeamUsersChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // 参加者でない
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockJoinStatusChain as any)
        .mockReturnValueOnce(mockUserCountChain as any)
        .mockReturnValueOnce(mockSheetsChain as any)
        .mockReturnValueOnce(mockTeamUsersChain as any);

      await expect(
        brainwritingLib.joinBrainwriting(1, "user-123", USAGE_SCOPE.TEAM)
      ).rejects.toThrow("参加できません");
    });
  });

  describe("createSheetsForTeam", () => {
    it("チーム用のシートと入力データを作成できる", async () => {
      const mockUsers = [
        { id: 1, user_id: "user-1" },
        { id: 2, user_id: "user-2" },
      ];

      const mockSheets = [
        { id: 1, brainwriting_id: 1, current_user_id: "user-1" },
        { id: 2, brainwriting_id: 1, current_user_id: "user-2" },
      ];

      const mockTransaction = vi.fn(async (callback: any) => {
        const mockTx = {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockUsers),
              }),
            }),
          }),
          insert: vi.fn().mockImplementation(() => ({
            values: vi.fn().mockReturnValue({
              returning: vi
                .fn()
                .mockResolvedValueOnce([mockSheets[0]])
                .mockResolvedValueOnce([mockSheets[1]]),
            }),
          })),
        };
        return await callback(mockTx);
      });

      vi.mocked(db.transaction).mockImplementation(mockTransaction);

      const result = await brainwritingLib.createSheetsForTeam(1);

      expect(db.transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe("rotateSheetToNextUser", () => {
    it("シートを次のユーザーに交代できる", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-1",
        lock_expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-1",
          input_user_name: "ユーザー1",
          row_index: 0,
          column_index: 0,
          content: "アイデア1",
        },
        {
          id: 2,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-2",
          input_user_name: "ユーザー2",
          row_index: 1,
          column_index: 0,
          content: "アイデア2",
        },
      ];

      const mockUsers = [
        { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1" },
        { id: 2, brainwriting_id: 1, user_id: "user-2", user_name: "ユーザー2" },
      ];

      // getBrainwritingSheetById
      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      // getBrainwritingInputsBySheetId
      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      // getBrainwritingUsersByBrainwritingId
      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      const mockUpdateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockInputsChain as any)
        .mockReturnValueOnce(mockUsersChain as any);

      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);

      const result = await brainwritingLib.rotateSheetToNextUser(1, "user-1");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
      expect(mockUpdateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          current_user_id: "user-2",
        })
      );
    });

    it("シートが存在しない場合、エラーをスローする", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockChain as any);

      await expect(brainwritingLib.rotateSheetToNextUser(999, "user-123")).rejects.toThrow(
        "シートが見つかりません"
      );
    });

    it("現在のユーザーが参加者に含まれない場合、エラーをスローする", async () => {
      const mockSheet = {
        id: 1,
        brainwriting_id: 1,
        current_user_id: "user-1",
      };

      const mockInputs = [
        {
          id: 1,
          brainwriting_id: 1,
          brainwriting_sheet_id: 1,
          input_user_id: "user-1",
          row_index: 0,
          column_index: 0,
          content: "アイデア1",
        },
      ];

      const mockUsers = [{ id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1" }];

      const mockSheetChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSheet]),
      };

      const mockInputsChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockInputs),
      };

      const mockUsersChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockUsers),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSheetChain as any)
        .mockReturnValueOnce(mockInputsChain as any)
        .mockReturnValueOnce(mockUsersChain as any);

      await expect(brainwritingLib.rotateSheetToNextUser(1, "user-999")).rejects.toThrow(
        "現在のユーザーが参加者一覧に見つかりません"
      );
    });
  });

  describe("clearAbandonedSessions", () => {
    it("放棄されたセッションをクリアできる", async () => {
      const mockSheetsToClear = [
        {
          brainwriting_sheet_id: 1,
          current_user_id: "user-123",
        },
      ];

      const mockSelectChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockSheetsToClear),
      };

      const mockUpdateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      const mockDeleteChain = {
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.selectDistinct).mockReturnValue(mockSelectChain as any);
      vi.mocked(db.update).mockReturnValue(mockUpdateChain as any);
      vi.mocked(db.delete).mockReturnValue(mockDeleteChain as any);

      await brainwritingLib.clearAbandonedSessions(1);

      expect(db.selectDistinct).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
      expect(db.delete).toHaveBeenCalledTimes(2); // inputs と users
    });

    it("クリア対象がない場合、何も削除しない", async () => {
      const mockChain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.selectDistinct).mockReturnValue(mockChain as any);

      await brainwritingLib.clearAbandonedSessions(1);

      expect(db.selectDistinct).toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
      expect(db.delete).not.toHaveBeenCalled();
    });
  });
});
