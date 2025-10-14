import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import AddUserClient from "@/components/mypage/AddUserClient";

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

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
