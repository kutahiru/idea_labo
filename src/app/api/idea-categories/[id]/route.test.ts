import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/idea-category", () => ({
  updateIdeaCategory: vi.fn(),
  deleteIdeaCategory: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
  apiErrors: {
    invalidId: () => {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    },
    invalidData: (message: unknown) => {
      return NextResponse.json({ error: message }, { status: 400 });
    },
    notFound: (resource: string) => {
      return NextResponse.json({ error: `${resource}が見つかりません` }, { status: 404 });
    },
    serverError: () => {
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    },
  },
}));

import { updateIdeaCategory, deleteIdeaCategory } from "@/lib/idea-category";
import { checkAuth } from "@/lib/api/utils";

describe("PUT /api/idea-categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたカテゴリ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/invalid", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたカテゴリ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("無効なIDです");
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "", // 空の名前（バリデーションエラー）
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("カテゴリが存在しない場合に404を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(updateIdeaCategory).mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const request = new NextRequest("http://localhost:3000/api/idea-categories/999", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたカテゴリ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にカテゴリを更新できる", async () => {
    const mockUpdatedCategory = {
      id: 1,
      user_id: "user-123",
      name: "更新されたカテゴリ",
      description: "更新された説明",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(updateIdeaCategory).mockResolvedValue(mockUpdatedCategory);

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたカテゴリ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockUpdatedCategory);
    expect(updateIdeaCategory).toHaveBeenCalledWith(1, "user-123", {
      name: "更新されたカテゴリ",
      description: "更新された説明",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(updateIdeaCategory).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたカテゴリ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});

describe("DELETE /api/idea-categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/invalid", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("カテゴリが存在しない場合に404を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(deleteIdeaCategory).mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const request = new NextRequest("http://localhost:3000/api/idea-categories/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にカテゴリを削除できる", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(deleteIdeaCategory).mockResolvedValue({ id: 1 });

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.message).toBe("削除が完了しました");
    expect(data.id).toBe(1);
    expect(deleteIdeaCategory).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(deleteIdeaCategory).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/idea-categories/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
