import { auth } from "@/app/lib/auth";
import MandalartHelpButton from "@/components/mandalarts/MandalartHelpButton";
import CreateIdeaButton from "@/components/ideas/CreateIdeaButton";

export default async function MandalartLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">マンダラート</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      {session?.user?.id && <CreateIdeaButton />}
      <MandalartHelpButton />
    </div>
  );
}
