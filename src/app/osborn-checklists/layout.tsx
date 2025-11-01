import { auth } from "@/app/lib/auth";
import OsbornChecklistHelpButton from "@/components/osborn-checklists/OsbornChecklistHelpButton";
import CreateIdeaButton from "@/components/ideas/CreateIdeaButton";

export default async function OsbornLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">オズボーンのチェックリスト</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      {session?.user?.id && <CreateIdeaButton />}
      <OsbornChecklistHelpButton />
    </div>
  );
}
