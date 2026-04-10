export type Widget = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: "AI" | "Productivity" | "Health" | "Utilities";
  featured?: boolean;
};

export const widgets: Widget[] = [
  {
    name: "Prompt Generator",
    slug: "prompt-generator",
    description: "Create structured AI prompts",
    icon: "🧠",
    category: "AI",
    featured: true,
  },

  {
    name: "Habit Tracker",
    slug: "habit-tracker",
    description: "Track daily habits",
    icon: "✅",
    category: "Productivity",
  },
];
