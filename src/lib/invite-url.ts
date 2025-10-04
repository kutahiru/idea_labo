import { randomBytes } from 'crypto';

// 招待URL用のランダムトークンを生成
export function generateInviteToken(): string {
  return randomBytes(16).toString('hex');
}

// 招待URLを生成
export function generateInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/brainwriting/join/${token}`;
}

// 招待URL用のトークンとURLを両方生成
export function generateInviteData(): { token: string; url: string } {
  const token = generateInviteToken();
  const url = generateInviteUrl(token);
  return { token, url };
}