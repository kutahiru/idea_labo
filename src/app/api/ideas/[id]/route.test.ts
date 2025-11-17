import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/idea", () => ({
  updateIdea: vi.fn(),
  deleteIdea: vi.fn(),
  checkIdeaOwnership: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  validateIdRequest: vi.fn(),
  apiErrors: {
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

import { updateIdea, deleteIdea, checkIdeaOwnership } from "@/lib/idea";
import { validateIdRequest } from "@/lib/api/utils";

describe("PUT /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/ideas/invalid", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("カテゴリIDが無効な場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "invalid",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("カテゴリIDが無効です");
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "", // 空の名前（バリデーションエラー）
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("所有者でない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
    const data = await response!.json();
    expect(data.error).toBe("アイデアが見つかりません");
  });

  it("アイデアが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    vi.mocked(updateIdea).mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const request = new NextRequest("http://localhost:3000/api/ideas/999", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にアイデアを更新できる", async () => {
    const mockUpdatedIdea = {
      id: 1,
      idea_category_id: 1,
      name: "更新されたアイデア",
      description: "更新されたコンテンツ",
      priority: "medium",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateIdea).mockResolvedValue(mockUpdatedIdea as any);

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.id).toBe(1);
    expect(data.name).toBe("更新されたアイデア");
    expect(data.description).toBe("更新されたコンテンツ");
    expect(updateIdea).toHaveBeenCalledWith(1, 1, {
      name: "更新されたアイデア",
      description: "更新されたコンテンツ",
      priority: "medium",
    });
  });

  it("更新中にサーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    vi.mocked(updateIdea).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "PUT",
      body: JSON.stringify({
        categoryId: "1",
        name: "更新されたアイデア",
        description: "更新されたコンテンツ",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});

describe("DELETE /api/ideas/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("所有者でない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("アイデアが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    vi.mocked(deleteIdea).mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const request = new NextRequest("http://localhost:3000/api/ideas/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にアイデアを削除できる", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    vi.mocked(deleteIdea).mockResolvedValue({ id: 1 });

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.message).toBe("削除が完了しました");
    expect(data.id).toBe(1);
    expect(deleteIdea).toHaveBeenCalledWith(1);
  });

  it("削除中にサーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(checkIdeaOwnership).mockResolvedValue(true);

    vi.mocked(deleteIdea).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/ideas/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
