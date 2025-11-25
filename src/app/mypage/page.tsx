import MyPageClient from "@/components/mypage/MyPageClient";
import { auth } from "@/app/lib/auth";
import { getUserById } from "@/lib/user";
import { LoginRequiredMessage } from "@/components/shared/Message";

/**
 * マイページコンポーネント
 *
 * 認証済みユーザーのプロフィール情報を表示・編集するページです。
 * ユーザー名の変更などのアカウント管理機能を提供します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - ユーザー情報が存在しない: エラーメッセージを表示
 *
 * ルート: /mypage
 *
 * @returns マイページクライアントコンポーネント、ログイン要求メッセージ、またはエラーメッセージ
 */
export default async function MyPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">ユーザー情報が見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">マイページ</h1>
      </div>
      <MyPageClient initialData={user} />
    </div>
  );
}
