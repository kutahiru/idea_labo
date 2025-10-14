import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function AuthCallbackPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  const redirectUrl = params.redirect || "/";

  // 未ログインの場合はログインページへ
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // ユーザー情報を取得
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.length === 0) {
    redirect("/auth/signin");
  }

  const userData = user[0];

  // 新規ユーザーの判定条件
  // 作成日時と更新日時が同じ（=まだ一度も更新されていない）
  const isNewUser = userData.created_at.getTime() === userData.updated_at.getTime();

  // 新規ユーザーの場合はユーザー名設定ページへ
  if (isNewUser) {
    const encodedRedirect = encodeURIComponent(redirectUrl);
    const addUserUrl = `/mypage/add-user?redirect=${encodedRedirect}`;
    redirect(addUserUrl);
  }

  // 既存ユーザーの場合は元のURLへリダイレクト
  redirect(redirectUrl);
}
