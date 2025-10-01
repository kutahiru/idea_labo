import { notFound, redirect } from "next/navigation";
import { getBrainwritingByToken, checkJoinStatus } from "@/lib/brainwriting";
import { auth } from "@/app/lib/auth";
import BrainwritingInviteClient from "@/components/brainwriting/BrainwritingInviteClient";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // トークンを使ってブレインライティングを取得
  const brainwritingData = await getBrainwritingByToken(token);

  // ブレインライティングが見つからない場合
  if (!brainwritingData) {
    notFound();
  }

  // 招待が無効な場合の表示
  if (!brainwritingData.isInviteActive) {
    return (
      <div className="py-2">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-alert mb-4 text-3xl font-bold">招待が無効です</h1>
            <p className="text-gray-600">この招待リンクは既に無効になっています。</p>
          </div>
        </div>
      </div>
    );
  }

  // ログイン状態をチェック
  const session = await auth();

  // ログイン済みの場合、参加状況をチェックして既に参加していればリダイレクト
  if (session?.user?.id) {
    const joinStatus = await checkJoinStatus(brainwritingData.id, session.user.id);
    if (joinStatus.isJoined && joinStatus.sheetId) {
      redirect(`/brainwriting/sheet/${joinStatus.sheetId}/input`);
    }
  }

  return <BrainwritingInviteClient brainwriting={brainwritingData} token={token} />;
}
