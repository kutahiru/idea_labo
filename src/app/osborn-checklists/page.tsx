import { auth } from "@/app/lib/auth";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { getOsbornChecklistsByUserId } from "@/lib/osborn-checklist";
import OsbornChecklistPageClient from "@/components/osborn-checklists/OsbornChecklistPageClient";

export default async function OsbornChecklistsPage() {
  const session = await auth();

  //認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const osbornChecklists = await getOsbornChecklistsByUserId(session.user.id);

  return <OsbornChecklistPageClient initialData={osbornChecklists} />;
}
