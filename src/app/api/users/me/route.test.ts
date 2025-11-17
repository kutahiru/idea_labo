import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/user", () => ({
  updateUser: vi.fn(),
  getUserById: vi.fn(),
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

import { updateUser, getUserById } from "@/lib/user";
import { checkAuth } from "@/lib/api/utils";

describe("PUT /api/users/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたユーザー名",
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "", // 空の名前（バリデーションエラー）
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
    const data = await response!.json();
    expect(data.error).toBeDefined();
  });

  it("正常にユーザー情報を更新できる", async () => {
    const mockUpdatedUser = {
      id: "user-123",
      name: "更新されたユーザー名",
      email: "test@example.com",
      image: "https://example.com/image.jpg",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateUser).mockResolvedValue(mockUpdatedUser as any);

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたユーザー名",
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockUpdatedUser);
    expect(updateUser).toHaveBeenCalledWith("user-123", {
      name: "更新されたユーザー名",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(updateUser).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "更新されたユーザー名",
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
    const data = await response!.json();
    expect(data.error).toBe("サーバーエラーが発生しました");
  });

  it("nameが100文字以内であれば更新できる", async () => {
    const longName = "あ".repeat(100);
    const mockUpdatedUser = {
      id: "user-123",
      name: longName,
      email: "test@example.com",
      image: null,
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateUser).mockResolvedValue(mockUpdatedUser as any);

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: longName,
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockUpdatedUser);
  });

  it("nameが100文字を超える場合に400を返す", async () => {
    const tooLongName = "あ".repeat(101);

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/users/me", {
      method: "PUT",
      body: JSON.stringify({
        name: tooLongName,
      }),
    });

    const response = await PUT(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });
});

describe("GET /api/users/me", () => {
  // GETメソッドのモックをインポート
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    const { GET } = await import("./route");

    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("正常にユーザー情報を取得できる", async () => {
    const { GET } = await import("./route");

    const mockUser = {
      id: "user-123",
      name: "テストユーザー",
      email: "test@example.com",
      image: "https://example.com/image.jpg",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getUserById).mockResolvedValue(mockUser as any);

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockUser);
    expect(getUserById).toHaveBeenCalledWith("user-123");
  });

  it("ユーザーが存在しない場合に404を返す", async () => {
    const { GET } = await import("./route");

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "non-existent-user",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getUserById).mockResolvedValue(null as any);

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    const { GET } = await import("./route");

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(getUserById).mockRejectedValue(new Error("Database error"));

    const response = await GET();

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
