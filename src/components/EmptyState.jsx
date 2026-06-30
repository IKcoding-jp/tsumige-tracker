import { Gamepad2 } from "lucide-react";

function EmptyState({ type }) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <p>一致するゲームはありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 text-muted-foreground">
      <Gamepad2 className="w-10 h-10 mb-3" />
      <p className="font-medium">積みゲーはまだありません</p>
      <p className="text-sm mt-1">
        上のフォームからタイトルを追加してみましょう。
      </p>
    </div>
  );
}

export default EmptyState;
