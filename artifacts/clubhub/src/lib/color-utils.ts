export const getClubColor = (id: number) => {
  const colors = [
    "bg-[#EF4444]", "bg-[#F97316]", "bg-[#F59E0B]", "bg-[#10B981]",
    "bg-[#14B8A6]", "bg-[#06B6D4]", "bg-[#3B82F6]", "bg-[#6366F1]",
    "bg-[#8B5CF6]", "bg-[#A855F7]", "bg-[#D946EF]", "bg-[#EC4899]",
    "bg-[#F43F5E]"
  ];
  return colors[id % colors.length];
};
