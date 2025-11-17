import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/idea", () => ({
  createIdea: vi.fn(),
}));

vi.mock("@/lib/idea-category", () => ({
  checkCategoryOwnership: vi.fn(),
}));

vi.mock("@/lib/api/utils", () => ({
  checkAuth: vi.fn(),
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

import { createIdea } from "@/lib/idea";
import { checkCategoryOwnership } from "@/lib/idea-category";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/ideas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "1",
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
    const data = await response!.json();
    expect(data.error).toBe("認証が必要です");
  });

  it("カテゴリIDが無効な場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "invalid",
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("カテゴリIDが無効です");
  });

  it("カテゴリIDが未設定の場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBe("カテゴリIDが無効です");
  });

  it("カテゴリの所有者でない場合に404を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(checkCategoryOwnership).mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "1",
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
    const data = await response!.json();
    expect(data.error).toBe("カテゴリが見つかりません");
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(checkCategoryOwnership).mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "1",
        name: "", // 空の名前（バリデーションエラー）
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBeDefined();
  });

  it("正常にアイデアを作成できる", async () => {
    const mockIdea = {
      id: 1,
      idea_category_id: 1,
      name: "テストアイデア",
      description: "テストコンテンツ",
      priority: "medium",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(checkCategoryOwnership).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createIdea).mockResolvedValue(mockIdea as any);

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "1",
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data.id).toBe(1);
    expect(data.name).toBe("テストアイデア");
    expect(data.description).toBe("テストコンテンツ");
    expect(createIdea).toHaveBeenCalledWith(1, {
      name: "テストアイデア",
      description: "テストコンテンツ",
      priority: "medium",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(checkCategoryOwnership).mockResolvedValue(true);

    vi.mocked(createIdea).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      body: JSON.stringify({
        categoryId: "1",
        name: "テストアイデア",
        description: "テストコンテンツ",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});
