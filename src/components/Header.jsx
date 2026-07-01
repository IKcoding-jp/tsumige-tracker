import { Button } from "@/components/ui/button";

function Header({ onSignOut, onRandomPick, randomPickDisabled }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">ツミゲ</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRandomPick}
          disabled={randomPickDisabled}
        >
          ランダム選出
        </Button>
        <Button variant="outline" onClick={onSignOut}>
          ログアウト
        </Button>
      </div>
    </div>
  );
}

export default Header;
