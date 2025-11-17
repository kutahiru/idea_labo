import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/idea-category", () => ({
  getIdeaCategoriesByUserId: vi.fn(),
  createIdeaCategory: vi.fn(),
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

import { getIdeaCategoriesByUserId, createIdeaCategory } from "@/lib/idea-category";
import { checkAuth } from "@/lib/api/utils";

describe("GET /api/idea-categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
    const data = await response!.json();
    expect(data.error).toBe("認証が必要です");
  });

  it("正常にカテゴリ一覧を取得できる", async () => {
    const mockCategories = [
      {
        id: 1,
        user_id: "user-123",
        name: "カテゴリ1",
        description: "説明1",
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        user_id: "user-123",
        name: "カテゴリ2",
        description: "説明2",
        created_at: "2024-01-02T00:00:00.000Z",
      },
    ];

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getIdeaCategoriesByUserId).mockResolvedValue(mockCategories as any);

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockCategories);
    expect(getIdeaCategoriesByUserId).toHaveBeenCalledWith("user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(getIdeaCategoriesByUserId).mockRejectedValue(new Error("Database error"));

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });
});

describe("POST /api/idea-categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/idea-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "新しいカテゴリ",
        description: "新しい説明",
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

    const request = new NextRequest("http://localhost:3000/api/idea-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "", // 空の名前（バリデーションエラー）
        description: "新しい説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBeDefined();
  });

  it("正常にカテゴリを作成できる", async () => {
    const mockCategory = {
      id: 1,
      user_id: "user-123",
      name: "新しいカテゴリ",
      description: "新しい説明",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(createIdeaCategory).mockResolvedValue(mockCategory);

    const request = new NextRequest("http://localhost:3000/api/idea-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "新しいカテゴリ",
        description: "新しい説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data).toEqual(mockCategory);
    expect(createIdeaCategory).toHaveBeenCalledWith("user-123", {
      name: "新しいカテゴリ",
      description: "新しい説明",
    });
  });

  it("descriptionがnullでも作成できる", async () => {
    const mockCategory = {
      id: 1,
      user_id: "user-123",
      name: "新しいカテゴリ",
      description: null,
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(createIdeaCategory).mockResolvedValue(mockCategory);

    const request = new NextRequest("http://localhost:3000/api/idea-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "新しいカテゴリ",
        description: null,
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data).toEqual(mockCategory);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(createIdeaCategory).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/idea-categories", {
      method: "POST",
      body: JSON.stringify({
        name: "新しいカテゴリ",
        description: "新しい説明",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
