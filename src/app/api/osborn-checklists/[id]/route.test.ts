import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";

// モジュールをモック
vi.mock("@/lib/osborn-checklist", () => ({
  updateOsbornChecklist: vi.fn(),
  deleteOsbornChecklist: vi.fn(),
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

import { updateOsbornChecklist, deleteOsbornChecklist } from "@/lib/osborn-checklist";
import { validateIdRequest } from "@/lib/api/utils";

describe("PUT /api/osborn-checklists/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたオズボーン",
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

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/invalid", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたオズボーン",
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

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
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

  it("オズボーンのチェックリストが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(updateOsbornChecklist).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/999", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたオズボーン",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  });

  it("正常に更新できる", async () => {
    const mockUpdated = {
      id: 1,
      userId: "user-123",
      title: "更新されたオズボーン",
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
    vi.mocked(updateOsbornChecklist).mockResolvedValue(mockUpdated as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたオズボーン",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockUpdated);
    expect(updateOsbornChecklist).toHaveBeenCalledWith(1, "user-123", {
      title: "更新されたオズボーン",
      themeName: "更新されたテーマ",
      description: "更新された説明",
    });
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(updateOsbornChecklist).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "更新されたオズボーン",
        themeName: "更新されたテーマ",
        description: "更新された説明",
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/osborn-checklists/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証なしで401を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      error: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
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

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/invalid", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "invalid" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
  });

  it("オズボーンのチェックリストが存在しない場合に404を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 999,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(deleteOsbornChecklist).mockResolvedValue(null as any);

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "999" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
  });

  it("正常に削除できる", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteOsbornChecklist).mockResolvedValue({ id: 1 });

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("削除が完了しました");
    expect(data.id).toBe(1);
    expect(deleteOsbornChecklist).toHaveBeenCalledWith(1, "user-123");
  });

  it("サーバーエラーが発生した場合に500を返す", async () => {
    vi.mocked(validateIdRequest).mockResolvedValue({
      userId: "user-123",
      id: 1,
    });

    vi.mocked(deleteOsbornChecklist).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/osborn-checklists/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) });

    expect(response).toBeDefined();
    expect(response.status).toBe(500);
  });
});
