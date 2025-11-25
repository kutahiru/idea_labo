import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import AddUserClient from "@/components/mypage/AddUserClient";

export const metadata: Metadata = {
  title: "ユーザー名設定",
  description: "アイデア研究所で使用するユーザー名を設定します",
};

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * ユーザー名設定ページコンポーネント
 *
 * 初回ログイン時やユーザー名が未設定の場合に表示されるページです。
 * ユーザーにユーザー名の入力を促し、設定完了後は元のページへリダイレクトします。
 *
 * リダイレクト機能：
 * - クエリパラメータ `redirect` で設定完了後の遷移先を指定可能
 * - デフォルトのリダイレクト先: `/`（ホーム）
 *
 * アクセス制限：
 * - 未ログインユーザー: サインインページへリダイレクト
 *
 * ルート: /mypage/add-user?redirect=/path
 *
 * @param searchParams - クエリパラメータ（redirect: リダイレクト先URL）
 * @returns ユーザー名設定クライアントコンポーネント、またはリダイレクト
 */
export default async function AddUserPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  const redirectUrl = params.redirect || "/";

  // 未ログインの場合はログインページへ
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            ユーザー名を設定してください
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600">
            アイデア研究所へようこそ！
            <br />
            ユーザー名を設定して始めましょう。
          </p>
          <AddUserClient currentName={session.user.name || ""} redirectUrl={redirectUrl} />
        </div>
      </div>
    </div>
  );
}
