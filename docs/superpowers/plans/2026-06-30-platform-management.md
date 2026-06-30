# プラットフォーム別管理 実装プラン（写経用）

> **進め方:** これは写経学習プロジェクト。Claude は .jsx を直接編集しない。
> 各ステップで Claude がコードを小さくチャットに出す → IK が手で打つ → 理解確認 → 次へ。
> 検証は各ステップの最後に「ブラウザで動作確認」で行う（テストフレームワークは無し）。

**ゴール:** 各ゲームをプラットフォーム（Switch/PS5/...）で入力・表示・絞り込みできるようにする。

**アーキテクチャ:** `games` テーブルに `platform`（NULL許容）カラムを追加。表示文字列をそのまま保存。
追加フォームに `<select>`、カードにバッジ、フィルターにドロップダウンを足す。絞り込みは
「ステータス AND プラットフォーム」の合わせ技。

**技術:** React + JavaScript + Supabase + Tailwind + shadcn/ui

## Global Constraints

- `platform` は NULL 許容。未設定（空文字）は `null` として保存する。
- 保存する値は表示文字列そのまま（`"Switch"`, `"PS5"`, `"PS4"`, `"Steam"`, `"PC"`, `"スマホ"`, `"その他"`）。
- プラットフォームの固定リストは1か所に定数 `PLATFORMS` として持ち、重複定義しない（DRY）。
- 既存データ（platform が NULL）は触らない。「未設定」として表示・絞り込みする。

---

### Task 1: DB にカラム追加（IK が Supabase ダッシュボードで実行）

**ファイル:** Supabase（コードではない）

- [ ] **Step 1:** Supabase ダッシュボード → SQL Editor で実行

```sql
alter table games add column platform text;
```

- [ ] **Step 2:** Table Editor で `games` に `platform` 列が増えたことを確認（既存行は空＝NULL）

---

### Task 2: 固定リスト定数 + 追加フォームの select

**ファイル:** `src/pages/GameListPage.jsx`

**Produces:** `PLATFORMS` 配列（Task 3・4 でも使う）／state `platform`

- [ ] **Step 1:** ファイル上部（import 群の下、`function GameListPage` の外）に定数を追加

```js
const PLATFORMS = ["Switch", "PS5", "PS4", "Steam", "PC", "スマホ", "その他"];
```

- [ ] **Step 2:** state を追加（`title` の useState の隣）

```js
const [platform, setPlatform] = useState("");
```

- [ ] **Step 3:** 追加フォームの input と「追加」ボタンの間に select を置く

```jsx
<select
  value={platform}
  onChange={(e) => setPlatform(e.target.value)}
  className="border rounded px-3 py-2"
>
  <option value="">未設定</option>
  {PLATFORMS.map((p) => (
    <option key={p} value={p}>
      {p}
    </option>
  ))}
</select>
```

- [ ] **Step 4:** `addGame` の insert に platform を乗せる（空文字なら null）

```js
await supabase.from("games").insert({
  title,
  user_id: session.user.id,
  status: "unplayed",
  platform: platform || null, // 空文字は null にして保存
});
```

- [ ] **Step 5:** 追加後に select も戻す（`setTitle("")` の隣）

```js
setPlatform("");
```

- [ ] **Step 6:** ブラウザで確認：プラットフォームを選んでゲーム追加 → Supabase の行に値が入る／未設定なら null

---

### Task 3: カードにプラットフォームのバッジ

**ファイル:** `src/components/GameCard.jsx`

**Consumes:** `game.platform`（null の可能性あり）

- [ ] **Step 1:** タイトルの `<span>` とステータスボタンの間にバッジを足す

```jsx
<span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
  {game.platform ?? "未設定"}
</span>
```

- [ ] **Step 2:** ブラウザで確認：各カードにプラットフォーム（または「未設定」）が出る

---

### Task 4: プラットフォームのフィルター（ドロップダウン）

**ファイル:** `src/pages/GameListPage.jsx`

**Consumes:** `PLATFORMS`（Task 2 で定義）

- [ ] **Step 1:** state を追加（`filter` の隣）

```js
const [platformFilter, setPlatformFilter] = useState("all");
```

- [ ] **Step 2:** ステータスフィルターのボタン群の隣にドロップダウンを置く

```jsx
<select
  value={platformFilter}
  onChange={(e) => setPlatformFilter(e.target.value)}
  className="border rounded px-3 py-2"
>
  <option value="all">すべて</option>
  {PLATFORMS.map((p) => (
    <option key={p} value={p}>
      {p}
    </option>
  ))}
  <option value="unset">未設定</option>
</select>
```

- [ ] **Step 3:** `visibleGames` の絞り込みを「ステータス AND プラットフォーム」に拡張

```js
const visibleGames = games.filter((game) => {
  // ステータス条件：all なら全部、そうでなければ一致
  const statusOk = filter === "all" || game.status === filter;
  // プラットフォーム条件：all なら全部／unset は null のみ／それ以外は一致
  const platformOk =
    platformFilter === "all" ||
    (platformFilter === "unset"
      ? !game.platform
      : game.platform === platformFilter);
  return statusOk && platformOk;
});
```

- [ ] **Step 4:** ブラウザで確認：ドロップダウンで絞れる／ステータスボタンと併用できる／「未設定」で NULL のものだけ出る

---

### Task 5: 仕上げ（デプロイ確認 + README 更新）

**ファイル:** `README.md`

- [ ] **Step 1:** `git add` → commit → push（husky が eslint --fix + prettier を実行）

```bash
git add -A
git commit -m "feat: ゲームをプラットフォーム別に管理する機能を追加"
git push
```

- [ ] **Step 2:** Vercel の自動デプロイ完了後、本番 https://tsumige-tracker.vercel.app/ で動作確認（既存データが壊れていないこと）

- [ ] **Step 3:** README の「今後の展望」から「プラットフォーム別管理」を「実装済み機能」へ移す

---

## Self-Review メモ

- spec の決定事項（1つ/固定リスト/7種/フィルターあり/未設定=NULL/ドロップダウン）→ Task 1〜4 で全てカバー。
- `PLATFORMS` は Task 2 で1回だけ定義し Task 4 で再利用（DRY）。
- 未設定の保存は `platform || null`、表示は `?? "未設定"`、絞り込みは `!game.platform` で一貫。
