import { Button } from "@/components/ui/button";
import { STATUS } from "@/utils/status";
import { PLATFORM } from "@/utils/platform";

function GameCard({ game, onEdit, onDelete, onStatusChange }) {
  const platformStyle = PLATFORM[game.platform];
  const PlatformIcon = platformStyle?.icon;
  return (
    <div className="flex items-center gap-2 p-3 border rounded">
      <span className="font-medium flex-1">{game.title}</span>
      <span
        className={`inline-flex items-center justify-center w-20 gap-1 text-xs px-2 py-1 rounded ${platformStyle?.className ?? "bg-gray-200 text-gray-500"}`}
      >
        {PlatformIcon && <PlatformIcon />}
        {game.platform ?? "未設定"}
      </span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatusChange(game.id, STATUS[game.status].next)}
          className={"w-20 " + STATUS[game.status].className}
        >
          {STATUS[game.status].label}
        </Button>
        <Button variant="outline" onClick={() => onEdit(game)}>
          編集
        </Button>
        <Button variant="destructive" onClick={() => onDelete(game.id)}>
          削除
        </Button>
      </div>
    </div>
  );
}

export default GameCard;
