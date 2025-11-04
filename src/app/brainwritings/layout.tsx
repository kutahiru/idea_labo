import { auth } from "@/app/lib/auth";
import BrainwritingHelpButton from "@/components/brainwritings/BrainwritingHelpButton";
import CreateIdeaButton from "@/components/ideas/CreateIdeaButton";

export default async function BrainwritingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">ブレインライティング</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      {session?.user?.id && <CreateIdeaButton />}
      <BrainwritingHelpButton />
    </div>
  );
}
