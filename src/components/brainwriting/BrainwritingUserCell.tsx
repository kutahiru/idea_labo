interface BrainwritingUserCellProps {
  userName: string;
}

export default function BrainwritingUserCell({ userName }: BrainwritingUserCellProps) {
  return (
    <div className="w-60">
      <div className="flex h-16 items-center justify-center border-2 border-gray-400 bg-white">
        <span className="text-gray-600">{userName}</span>
      </div>
    </div>
  );
}