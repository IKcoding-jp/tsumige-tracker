export const STATUS = {
  unplayed: { label: "未プレイ", className: "text-gray-500", next: "playing" },
  playing: {
    label: "プレイ中",
    className: "border-blue-500 text-blue-500",
    next: "cleared",
  },
  cleared: {
    label: "クリア済み",
    className: "border-green-600 text-green-600",
    next: "unplayed",
  },
};
