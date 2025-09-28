interface ParticipantCellProps {
  participantName: string;
}

export default function ParticipantCell({ participantName }: ParticipantCellProps) {
  return (
    <div className="w-60">
      <div className="flex h-16 items-center justify-center border-2 border-gray-400 bg-white">
        <span className="text-gray-600">{participantName}</span>
      </div>
    </div>
  );
}