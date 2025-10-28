import { randomBytes } from "crypto";

// ランダムトークンを生成（汎用）
export function generateToken(): string {
  return randomBytes(16).toString("hex");
}

// 招待URL用のランダムトークンを生成（後方互換性のため残す）
export function generateInviteToken(): string {
  return generateToken();
}

// 招待URLを生成
export function generateInviteUrl(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Invite token is required");
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/brainwritings/invite/${token}`;
}

// 招待URL用のトークンとURLを両方生成
export function generateInviteData(): { token: string; url: string } {
  const token = generateToken();
  const url = generateInviteUrl(token);
  return { token, url };
}

// マンダラート公開URLを生成
export function generateMandalartPublicUrl(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Public token is required");
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mandalarts/public/${token}`;
}

// オズボーンのチェックリスト公開URLを生成
export function generateOsbornChecklistPublicUrl(token: string | null | undefined): string {
  if (!token) {
    throw new Error("Public token is required");
  }
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/osborn-checklists/public/${token}`;
}
