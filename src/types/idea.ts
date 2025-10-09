export interface IdeaListItem {
  id: number;
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  created_at: Date;
}
