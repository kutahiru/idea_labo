import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/mandalart", () => ({
  getMandalartDetailById: vi.fn(),
  updateMandalart: vi.fn(),
  deleteMandalart: vi.fn(),
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

import { getMandalartDetailById, updateMandalart, deleteMandalart } from "@/lib/mandalart";
import { validateIdRequest } from "@/lib/api/utils";

describe("GET /api/mandalarts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/invalid", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("マンダラートが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMandalartDetailById).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/999", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  });

  it("正常にマンダラート詳細を取得できる", async () => {
    const mockDetail = {
      id: 1,
      userId: "user-123",
      title: "テストマンダラート",
      themeName: "テストテーマ",
      description: "テスト説明",
      publicToken: "test-token",
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
      inputs: [],
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getMandalartDetailById).mockResolvedValue(mockDetail as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockDetail);
    expect(getMandalartDetailById).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(getMandalartDetailById).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "GET",
    });

    const response = await GET(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});

describe("PUT /api/mandalarts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたマンダラート",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/invalid", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたマンダラート",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("バリデーションエラーがある場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "", // 空のタイトル（バリデーションエラー）
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("マンダラートが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateMandalart).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/999", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたマンダラート",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  });

  it("正常にマンダラートを更新できる", async () => {
    const mockUpdated = {
      id: 1,
      userId: "user-123",
      title: "更新されたマンダラート",
      themeName: "更新されたテーマ",
      description: "更新された説明",
      publicToken: "test-token",
      isResultsPublic: false,
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateMandalart).mockResolvedValue(mockUpdated as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたマンダラート",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockUpdated);
    expect(updateMandalart).toHaveBeenCalledWith(1, "user-123", {
      title: "更新されたマンダラート",
      themeName: "更新されたテーマ",
      description: "更新された説明",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(updateMandalart).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたマンダラート",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/mandalarts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
  });

  it("無効なIDの場合に400を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "無効なIDです" }, { status: 400 }),
    });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/invalid", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("マンダラートが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(deleteMandalart).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/mandalarts/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  });

  it("正常にマンダラートを削除できる", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteMandalart).mockResolvedValue({ id: 1 });

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("削除が完了しました");
    expect(data.id).toBe(1);
    expect(deleteMandalart).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteMandalart).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/mandalarts/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
