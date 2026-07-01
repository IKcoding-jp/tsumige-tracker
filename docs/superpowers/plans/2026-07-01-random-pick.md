# ランダム選出ボタン Implementation Plan

> **実行方法（このプロジェクト固有）：** `.claude/rules/claude-role.md` により、Claude はコードをファイルへ直接書き込まない（フックでブロック済み）。実装は写経形式で進める：Claude がブロック単位でコードを提示 → IK が自分でタイプ → 理解確認 → 次のブロックへ。各タスク完了後に `npm run dev` でブラウザ目視確認を行う（このプロジェクトに自動テストは導入されていないため）。

**Goal:** 未プレイのゲームからランダムに1本選び、「選んでいます…」演出のあとモーダルで表示するボタンを実装する。

**Architecture:** `GameListPage.jsx` が選出ロジック（state・タイマー）を持ち、`Header.jsx` はボタンの見た目のみ、`RandomPickOverlay.jsx` は演出中の見た目のみを担当する。選出後は既存の `GameModal` をそのまま再利用する。

**Tech Stack:** React 19 / Vite / Tailwind（既存スタックのまま、追加ライブラリなし）

## Global Constraints

- 型アノテーション・JSDoc は書かない（プロジェクト規約）
- コメントは日本語、コードから自明なものは書かない
- 関数コンポーネント・`.jsx` 拡張子
- 設計書 `docs/superpowers/specs/2026-07-01-random-pick-design.md` の要件外（フィルタ連動など）はやらない

---

### Task 1: RandomPickOverlay コンポーネント新規作成

**Files:**
- Create: `src/components/RandomPickOverlay.jsx`

**Interfaces:**
- Produces: `RandomPickOverlay({ title })` — props `title`（string、現在パラパラ表示中のタイトル）を受け取り、オーバーレイ表示するだけの見た目専用コンポーネント。ロジックは持たない。

- [ ] **Step 1: コンポーネントを作成**

```jsx
function RandomPickOverlay({ title }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-2">選んでいます…</p>
        <p className="text-lg font-bold animate-pulse">{title}</p>
      </div>
    </div>
  );
}

export default RandomPickOverlay;
```

- [ ] **Step 2: 動作確認**

この時点では単体で表示する場所がないため、見た目の確認は Task 3 まで持ち越す。構文エラーがないことだけ `npm run lint` で確認する。

Run: `npm run lint`
Expected: `RandomPickOverlay.jsx` に関するエラーが出ない

- [ ] **Step 3: コミット**

```bash
git add src/components/RandomPickOverlay.jsx
git commit -m "feat: ランダム選出の演出用オーバーレイを追加"
```

---

### Task 2: Header にランダム選出ボタンを追加

**Files:**
- Modify: `src/components/Header.jsx`

**Interfaces:**
- Consumes: なし（Task 1 に依存しない）
- Produces: `Header({ onSignOut, onRandomPick, randomPickDisabled })` — `onRandomPick`（クリック時に呼ぶ関数）、`randomPickDisabled`（boolean、ボタンを無効化するか）を新規 props として追加

- [ ] **Step 1: props とボタンを追加**

`src/components/Header.jsx` を以下の内容に変更する：

```jsx
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
```

- [ ] **Step 2: 動作確認**

この時点では呼び出し元（`GameListPage.jsx`）が props を渡していないため、`onRandomPick` は `undefined` のまま。`npm run dev` を起動し、ボタンが表示されること・レイアウトが崩れていないことだけ目視確認する。

Run: `npm run dev`
Expected: ヘッダーに「ランダム選出」「ログアウト」の2つのボタンが横並びで表示される

- [ ] **Step 3: コミット**

```bash
git add src/components/Header.jsx
git commit -m "feat: ヘッダーにランダム選出ボタンを追加"
```

---

### Task 3: GameListPage に選出ロジックを実装

**Files:**
- Modify: `src/pages/GameListPage.jsx`

**Interfaces:**
- Consumes:
  - `Header({ onSignOut, onRandomPick, randomPickDisabled })`（Task 2 で定義）
  - `RandomPickOverlay({ title })`（Task 1 で定義）
- Produces: なし（末端のページコンポーネント）

- [ ] **Step 1: import を追加**

`src/pages/GameListPage.jsx` 冒頭の import 群に1行追加：

```jsx
import RandomPickOverlay from "../components/RandomPickOverlay";
```

- [ ] **Step 2: state を追加**

既存の `const [platformFilter, setPlatformFilter] = useState("all");` の直後に追加：

```jsx
const [isPicking, setIsPicking] = useState(false);
const [pickingTitle, setPickingTitle] = useState("");
```

- [ ] **Step 3: handleRandomPick 関数を追加**

`handleAddGame` 関数の直後に追加：

```jsx
function handleRandomPick() {
  const unplayedGames = games.filter((game) => game.status === "unplayed");
  if (unplayedGames.length === 0) return;

  setIsPicking(true);
  const intervalId = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * unplayedGames.length);
    setPickingTitle(unplayedGames[randomIndex].title);
  }, 100);

  setTimeout(() => {
    clearInterval(intervalId);
    const randomIndex = Math.floor(Math.random() * unplayedGames.length);
    setSelectedGame(unplayedGames[randomIndex]);
    setIsPicking(false);
  }, 1200);
}
```

- [ ] **Step 4: Header の呼び出しに props を渡す**

既存の `<Header onSignOut={handleSignOut} />` を以下に変更：

```jsx
<Header
  onSignOut={handleSignOut}
  onRandomPick={handleRandomPick}
  randomPickDisabled={
    isPicking || !games.some((game) => game.status === "unplayed")
  }
/>
```

- [ ] **Step 5: 演出中オーバーレイの条件付きレンダーを追加**

既存の `{selectedGame !== null && ( <GameModal ... /> )}` ブロックの直前に追加：

```jsx
{isPicking && <RandomPickOverlay title={pickingTitle} />}
```

- [ ] **Step 6: 動作確認**

Run: `npm run dev`

ブラウザで以下を確認する：
1. 未プレイのゲームが1件以上ある状態で「ランダム選出」を押す → タイトルがパラパラ切り替わる演出が約1.2秒表示され、その後 `GameModal` が選ばれたゲームで開く
2. すべてのゲームを「プレイ中」または「クリア済み」にする（未プレイ0件）→「ランダム選出」ボタンが disabled になる
3. 演出中にボタンを連打できないこと（disabled になっている）

- [ ] **Step 7: コミット**

```bash
git add src/pages/GameListPage.jsx
git commit -m "feat: 積みゲートラッカーにランダム選出ボタンの選出ロジックを実装"
```

---

---

### Task 4: 抽選結果を専用画面で表示する（設計見直し）

Task 3 まで実装・動作確認した結果、`GameModal`（編集モーダル）を抽選結果表示に流用すると体験として噛み合わないと判明。設計書を更新し、専用の結果画面 `RandomPickResult` を新設する。

**Files:**
- Create: `src/components/RandomPickResult.jsx`
- Modify: `src/pages/GameListPage.jsx`

**Interfaces:**
- Produces: `RandomPickResult({ game, onStart, onClose })` — `game`（表示するゲーム）、`onStart`（「プレイ開始」クリック時）、`onClose`（「閉じる」クリック時）を受け取る見た目専用コンポーネント

- [ ] **Step 1: RandomPickResult コンポーネントを作成**

```jsx
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
```

- [ ] **Step 2: GameListPage の state を `pickedGame` に差し替え**

`selectedGame` はカード編集用にそのまま残す。抽選結果専用に新しい state を追加する：

```jsx
const [pickedGame, setPickedGame] = useState(null);
```

- [ ] **Step 3: handleRandomPick の確定処理を書き換え**

`setTimeout` の中の `setSelectedGame(unplayedGames[randomIndex]);` を `setPickedGame(unplayedGames[randomIndex]);` に変更する。

- [ ] **Step 4: RandomPickResult の条件付きレンダーを追加**

`{isPicking && <RandomPickOverlay title={pickingTitle} />}` の直後に追加：

```jsx
{pickedGame !== null && (
  <RandomPickResult
    game={pickedGame}
    onStart={() => {
      updateStatus(pickedGame.id, "playing");
      setPickedGame(null);
    }}
    onClose={() => setPickedGame(null)}
  />
)}
```

- [ ] **Step 5: import を追加**

```jsx
import RandomPickResult from "../components/RandomPickResult";
```

- [ ] **Step 6: 動作確認**

Run: `npm run dev`

1. 「ランダム選出」→ 演出後、専用の結果画面（タイトル＋「閉じる」「プレイ開始」ボタン）が開くこと
2. 「プレイ開始」を押すと、そのゲームのステータスが「プレイ中」に変わり、一覧に反映されること
3. 「閉じる」を押すと結果画面が閉じ、ステータスは変わらないこと
4. カードをクリックしたときは今まで通り `GameModal`（編集）が開くこと（影響がないことの確認）

- [ ] **Step 7: コミット**

```bash
git add src/components/RandomPickResult.jsx src/pages/GameListPage.jsx
git commit -m "feat: 抽選結果を専用画面で表示するよう変更"
```

## Self-Review

- **Spec coverage:** 設計書の要件（未プレイから選出／GameModal再利用／0件でdisabled／ガチャ演出）はすべて Task 1〜3 でカバーされている
- **Placeholder scan:** TBD・TODO なし。すべてのコードブロックは完全な内容
- **Type consistency:** `onRandomPick` / `randomPickDisabled` の props 名は Task 2 と Task 3 で一致。`title` prop も Task 1 と Task 3 で一致
