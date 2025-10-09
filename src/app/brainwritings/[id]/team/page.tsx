import { auth } from "@/app/lib/auth";
import { getBrainwritingTeamByBrainwritingId, checkJoinStatus } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingTeamClient from "@/components/brainwritings/BrainwritingTeamClient";
import { LoginRequiredMessage } from "@/components/shared/Message";

interface BrainwritingTeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function BrainwritingTeamPage({ params }: BrainwritingTeamPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const brainwritingId = parseInt(id);

  if (isNaN(brainwritingId)) {
    notFound();
  }

  const joinStatus = await checkJoinStatus(brainwritingId, session.user.id);

  if (!joinStatus.isJoined) {
    notFound();
  }

  const brainwritingTeam = await getBrainwritingTeamByBrainwritingId(brainwritingId);

  if (!brainwritingTeam) {
    notFound();
  }

  return (
    <BrainwritingTeamClient brainwritingTeam={brainwritingTeam} currentUserId={session.user.id} />
  );
}
