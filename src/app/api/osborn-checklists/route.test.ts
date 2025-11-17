import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/osborn-checklist", () => ({
  createOsbornChecklist: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidData: (message: unknown) => {
      return NextResponse.json({ error: message }, { status: 400 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { createOsbornChecklist } from "@/lib/osborn-checklist";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/osborn-checklists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists", {
      method: "POST",
      body: JSON.stringify({
        title: "テストオズボーン",
        themeName: "テストテーマ",
        description: "テスト説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists", {
      method: "POST",
      body: JSON.stringify({
        title: "", // 空のタイトル
        themeName: "テストテーマ",
        description: "テスト説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("正常にオズボーンのチェックリストを作成できる", async () => {
    const mockOsbornChecklist = {
      id: 1,
      userId: "user-123",
      title: "テストオズボーン",
      themeName: "テストテーマ",
      description: "テスト説明",
      publicToken: "test-token",
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createOsbornChecklist).mockResolvedValue(mockOsbornChecklist as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists", {
      method: "POST",
      body: JSON.stringify({
        title: "テストオズボーン",
        themeName: "テストテーマ",
        description: "テスト説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data).toEqual(mockOsbornChecklist);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(createOsbornChecklist).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists", {
      method: "POST",
      body: JSON.stringify({
        title: "テストオズボーン",
        themeName: "テストテーマ",
        description: "テスト説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
