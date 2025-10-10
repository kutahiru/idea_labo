import MyPageClient from "@/components/mypage/MyPageClient";
import { auth } from "@/app/lib/auth";
import { getUserById } from "@/lib/user";
import { LoginRequiredMessage } from "@/components/shared/Message";

export default async function MyPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">ユーザー情報が見つかりません</p>
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
