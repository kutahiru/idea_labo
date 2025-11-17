import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/osborn-checklist", () => ({
  upsertOsbornChecklistInput: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
}));

vi.mock("@/schemas/osborn-checklist", () => ({
  OSBORN_CHECKLIST_TYPES: {
    SUBSTITUTE: "substitute",
    COMBINE: "combine",
    ADAPT: "adapt",
    MODIFY: "modify",
    PUT_TO_OTHER_USES: "put_to_other_uses",
    ELIMINATE: "eliminate",
    REVERSE: "reverse",
  },
}));

import { upsertOsbornChecklistInput } from "@/lib/osborn-checklist";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/osborn-checklists/inputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: 1,
        checklistType: "substitute",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("osbornChecklistIdが無効（非数値）で400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: "invalid",
        checklistType: "substitute",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("オズボーンのチェックリストIDが無効です");
  });

  it("osbornChecklistIdが未指定で400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        checklistType: "substitute",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("checklistTypeが無効で400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: 1,
        checklistType: "invalid_type",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("チェックリストタイプが無効です");
  });

  it("contentが未指定でも正常に保存できる（空文字列）", async () => {
    const mockResult = {
      id: 1,
      osbornChecklistId: 1,
      userId: "user-123",
      checklistType: "substitute",
      content: "",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(upsertOsbornChecklistInput).mockResolvedValue(mockResult as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: 1,
        checklistType: "substitute",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(upsertOsbornChecklistInput).toHaveBeenCalledWith(
      1,
      "user-123",
      "substitute",
      ""
    );
  });

  it("正常に入力データを保存できる", async () => {
    const mockResult = {
      id: 1,
      osbornChecklistId: 1,
      userId: "user-123",
      checklistType: "substitute",
      content: "テスト入力",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(upsertOsbornChecklistInput).mockResolvedValue(mockResult as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: 1,
        checklistType: "substitute",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(upsertOsbornChecklistInput).toHaveBeenCalledWith(
      1,
      "user-123",
      "substitute",
      "テスト入力"
    );
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(upsertOsbornChecklistInput).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/inputs", {
      method: "POST",
      body: JSON.stringify({
        osbornChecklistId: 1,
        checklistType: "substitute",
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
