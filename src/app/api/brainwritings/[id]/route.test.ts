import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/brainwriting", () => ({
  getBrainwritingDetailById: vi.fn(),
  updateBrainwriting: vi.fn(),
  deleteBrainwriting: vi.fn(),
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

import { getBrainwritingDetailById, updateBrainwriting, deleteBrainwriting } from "@/lib/brainwriting";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/brainwritings/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/invalid", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("ブレインライティングが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingDetailById).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/999", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にブレインライティング詳細を取得できる", async () => {
    const mockDetail = {
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
      users: [],
      sheets: [],
      inputs: [],
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getBrainwritingDetailById).mockResolvedValue(mockDetail as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockDetail);
    expect(getBrainwritingDetailById).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getBrainwritingDetailById).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});

describe("PUT /api/brainwritings/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: "xpost",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "", // 空のタイトル（バリデーションエラー）
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: "xpost",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it("ブレインライティングが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateBrainwriting).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/999", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: "xpost",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にブレインライティングを更新できる", async () => {
    const mockUpdatedBrainwriting = {
      id: 1,
      userId: "user-123",
      title: "更新されたブレインライティング",
      themeName: "更新されたテーマ",
      description: "更新された説明",
      usageScope: "xpost" as const,
      inviteToken: "test-token",
      isInviteActive: true,
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateBrainwriting).mockResolvedValue(mockUpdatedBrainwriting as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: "xpost",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data).toEqual(mockUpdatedBrainwriting);
    expect(updateBrainwriting).toHaveBeenCalledWith(1, "user-123", {
      title: "更新されたブレインライティング",
      themeName: "更新されたテーマ",
      description: "更新された説明",
      usageScope: "xpost",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(updateBrainwriting).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたブレインライティング",
        themeName: "更新されたテーマ",
        description: "更新された説明",
        usageScope: "xpost",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});

describe("DELETE /api/brainwritings/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(401);
  });

  it("ブレインライティングが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(deleteBrainwriting).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/brainwritings/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(404);
  });

  it("正常にブレインライティングを削除できる", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteBrainwriting).mockResolvedValue({ id: 1 });

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(200);
    const data = await response!.json();
    expect(data.message).toBe("削除が完了しました");
    expect(data.id).toBe(1);
    expect(deleteBrainwriting).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteBrainwriting).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/brainwritings/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response!.status).toBe(500);
  });
});
