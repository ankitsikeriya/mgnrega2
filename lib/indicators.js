export function resolveIndicatorColor(ratio) {
  if (ratio == null) return "bg-gray-300";
  if (ratio >= 0.75) return "bg-green-500";
  if (ratio >= 0.35) return "bg-orange-400";
  return "bg-red-500";
}
