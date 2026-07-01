import { Button } from "@/components/ui/button";

function RandomPickResult({ game, onStart, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-2">今日はこれ！</p>
        <p className="text-lg font-bold mb-4">{game.title}</p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={onStart}>プレイ開始</Button>
        </div>
      </div>
    </div>
  );
}

export default RandomPickResult;
