import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingCompleteContent from "@/components/brainwriting/BrainwritingCompleteContent";

interface BrainwritingCompletePageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function BrainwritingCompletePage({
  params,
}: BrainwritingCompletePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="py-8 text-center">ログインが必要です</div>;
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

  const { sheets: _sheets, inputs: _inputs, users: _users, ...brainwriting } = brainwritingDetail;

  return (
    <BrainwritingCompleteContent
      brainwriting={brainwriting}
    />
  );
}
