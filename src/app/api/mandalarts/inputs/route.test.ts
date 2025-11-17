import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/mandalart", () => ({
  upsertMandalartInput: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidData: (message: unknown) => {
      return NextResponse.json({ error: message }, { status: 400 });
    },
    forbidden: () => {
      return NextResponse.json({ error: "アクセスが拒否されました" }, { status: 403 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { upsertMandalartInput } from "@/lib/mandalart";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/mandalarts/inputs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: 1,
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("バリデーションエラーがある場合に400を返す - mandalartIdが文字列", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: "invalid",
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("バリデーションエラーがある場合に400を返す - 必須フィールド欠落", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: 1,
        sectionRowIndex: 0,
        // sectionColumnIndexが欠落
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("アクセス拒否の場合に403を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(upsertMandalartInput).mockRejectedValue(new Error("Unauthorized"));

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: 1,
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(403);
  });

  it("正常に入力データを保存できる", async () => {
    const mockResult = {
      id: 1,
      mandalartId: 1,
      userId: "user-123",
      sectionRowIndex: 0,
      sectionColumnIndex: 0,
      rowIndex: 0,
      columnIndex: 0,
      content: "テスト入力",
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(upsertMandalartInput).mockResolvedValue(mockResult as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: 1,
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResult);
    expect(upsertMandalartInput).toHaveBeenCalledWith(
      1,
      "user-123",
      0,
      0,
      0,
      0,
      "テスト入力"
    );
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(upsertMandalartInput).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/mandalarts/inputs", {
      method: "POST",
      body: JSON.stringify({
        mandalartId: 1,
        sectionRowIndex: 0,
        sectionColumnIndex: 0,
        rowIndex: 0,
        columnIndex: 0,
        content: "テスト入力",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
