"use client";

import { useState } from "react";
import BrainwritingIndexRow from "./BrainwritingIndexRow";
import { BrainwritingListItem } from "@/types/brainwriting";

interface BrainwritingIndexProps {
  initialData: BrainwritingListItem[];
}

export default function BrainwritingIndex({ initialData }: BrainwritingIndexProps) {
  const [brainwritings, setBrainwritings] = useState(initialData);

  return (
    <div className="space-y-4">
      {brainwritings.map(brainwriting => (
        <BrainwritingIndexRow key={brainwriting.id} {...brainwriting} />
      ))}
    </div>
  );
}
