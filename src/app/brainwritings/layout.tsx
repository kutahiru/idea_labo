import BrainwritingHelpButton from "@/components/brainwritings/BrainwritingHelpButton";

export default function BrainwritingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">ブレインライティング</h1>
      </div>
      <div className="container mx-auto px-4">{children}</div>

      <BrainwritingHelpButton />
    </div>
  );
}
