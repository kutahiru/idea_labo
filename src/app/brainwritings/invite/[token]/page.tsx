import { notFound, redirect } from "next/navigation";
import { getBrainwritingByToken, checkJoinStatus } from "@/lib/brainwriting";
import { auth } from "@/app/lib/auth";
import BrainwritingInviteClient from "@/components/brainwritings/BrainwritingInviteClient";
import { USAGE_SCOPE } from "../../../../utils/brainwriting";

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

  // 招待ページコンポーネント
  const inviteComponent = (
    <BrainwritingInviteClient brainwriting={brainwritingData} token={token} />
  );

  const session = await auth();

  // 未ログインの場合は招待ページを表示(ログインへの誘導あり)
  if (!session?.user?.id) {
    return inviteComponent;
  }

  const joinStatus = await checkJoinStatus(brainwritingData.id, session.user.id);

  // 未参加の場合は招待ページを表示
  if (!joinStatus.isJoined) {
    return inviteComponent;
  }

  // 既に参加している場合は適切なページにリダイレクト
  if (brainwritingData.usageScope === USAGE_SCOPE.XPOST) {
    redirect(`/brainwritings/sheet/${joinStatus.sheetId}/input`);
  } else if (brainwritingData.usageScope === USAGE_SCOPE.TEAM) {
    redirect(`/brainwritings/${brainwritingData.id}/team`);
  }
}
