import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  createBrainwriting: vi.fn(),
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

import { createBrainwriting } from "@/lib/brainwriting";
import { checkAuth } from "@/lib/api/utils";

describe("POST /api/brainwritings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: "xpost",
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

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("無効なusageScopeの場合に400を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: "invalid",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("正常にブレインライティングを作成できる（xpost版）", async () => {
    const mockBrainwriting = {
      id: 1,
      userId: "user-123",
      title: "テストブレインライティング",
      themeName: "テストテーマ",
      description: "テスト説明",
      usageScope: "xpost" as const,
      inviteToken: "test-token",
      isInviteActive: true,
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createBrainwriting).mockResolvedValue(mockBrainwriting as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data).toEqual(mockBrainwriting);
    expect(createBrainwriting).toHaveBeenCalledWith("user-123", {
      title: "テストブレインライティング",
      themeName: "テストテーマ",
      description: "テスト説明",
      usageScope: "xpost",
    });
  });

  it("正常にブレインライティングを作成できる（team版）", async () => {
    const mockBrainwriting = {
      id: 2,
      userId: "user-123",
      title: "チーム版ブレインライティング",
      themeName: "チームテーマ",
      description: "チーム説明",
      usageScope: "team" as const,
      inviteToken: "team-token",
      isInviteActive: true,
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createBrainwriting).mockResolvedValue(mockBrainwriting as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "チーム版ブレインライティング",
        themeName: "チームテーマ",
        description: "チーム説明",
        usageScope: "team",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
    const data = await response!.json();
    expect(data).toEqual(mockBrainwriting);
  });

  it("descriptionがnullでも作成できる", async () => {
    const mockBrainwriting = {
      id: 1,
      userId: "user-123",
      title: "テストブレインライティング",
      themeName: "テストテーマ",
      description: null,
      usageScope: "xpost" as const,
      inviteToken: "test-token",
      isInviteActive: true,
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createBrainwriting).mockResolvedValue(mockBrainwriting as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: null,
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(201);
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(checkAuth).mockResolvedValue({
      userId: "user-123",
    });

    vi.mocked(createBrainwriting).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings", {
      method: "POST",
      body: JSON.stringify({
        title: "テストブレインライティング",
        themeName: "テストテーマ",
        description: "テスト説明",
        usageScope: "xpost",
      }),
    });

    const response = await POST(request);

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
