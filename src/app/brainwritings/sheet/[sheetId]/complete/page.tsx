import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingCompleteContent from "@/components/brainwritings/BrainwritingCompleteContent";
import { LoginRequiredMessage } from "@/components/shared/Message";

interface BrainwritingCompletePageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function BrainwritingCompletePage({ params }: BrainwritingCompletePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { sheetId } = await params;
  const brainwritingSheetId = parseInt(sheetId);

  if (isNaN(brainwritingSheetId)) {
    notFound();
  }

  const brainwritingDetail = await getBrainwritingDetailForBrainwritingUser(
    brainwritingSheetId,
    session.user.id
  );

  if (!brainwritingDetail) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;

  return (
    <BrainwritingCompleteContent
      brainwriting={brainwriting}
      remainingUserCount={6 - users.length}
    />
  );
}
