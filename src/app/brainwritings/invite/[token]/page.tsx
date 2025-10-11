import { notFound, redirect } from "next/navigation";
import { getBrainwritingByToken, checkJoinStatus } from "@/lib/brainwriting";
import { auth } from "@/app/lib/auth";
import BrainwritingInviteClient from "@/components/brainwritings/BrainwritingInviteClient";
import { USAGE_SCOPE } from "../../../../utils/brainwriting";
import type { Metadata } from "next";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

// 動的メタデータを生成
export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { token } = await params;
  const brainwritingData = await getBrainwritingByToken(token);

  if (!brainwritingData) {
    return {
      title: "招待が見つかりません",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImageUrl = `${siteUrl}/brainwriting-ogp.png`;

  return {
    title: `ブレインライティングに招待されました - ${brainwritingData.themeName}`,
    description: `テーマ「${brainwritingData.themeName}」のブレインライティングに参加しませんか？`,
    openGraph: {
      title: `ブレインライティングに招待されました`,
      description: `テーマ: ${brainwritingData.themeName}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "ブレインライティング",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `ブレインライティングに招待されました`,
      description: `テーマ: ${brainwritingData.themeName}`,
      images: [ogImageUrl],
    },
  };
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
