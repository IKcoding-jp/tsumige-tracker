import { Button } from "@/components/ui/button";

function GameModal({ value, onChange, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">タイトルを編集</h2>
        <input
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 w-full mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onSave}>確定</Button>
        </div>
      </div>
    </div>
  );
}

export default GameModal;
