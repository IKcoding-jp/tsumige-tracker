# 積みゲーランダム選出ボタン 設計書

- 日付: 2026-07-01
- 対象Issue: #18
- ブランチ: feat/random-pick

## 背景・目的

積みゲー（未プレイのゲーム）が増えると「今日どれをやるか」決められず手が止まる。
未プレイのゲームからランダムに1本選んで提示することで、選択の負担を減らす。

## 要件

- 「ランダム選出」ボタンを押すと、`status === "unplayed"` のゲームから1本をランダムに選ぶ
- 選ばれたゲームは専用の結果画面で表示する（タイトル表示＋「プレイ開始」ボタン）
- 未プレイのゲームが0件のとき、ボタンは disabled にする
- 選出時に「選んでいます…」風の演出（ガチャ感）を入れる。演出中はパラパラとタイトルが切り替わり、最後に確定したゲームの結果画面が開く

### 結果画面についての追記（実装後の見直し）

当初 `GameModal`（タイトル編集用モーダル）を流用する設計だったが、実装して動かしてみたところ「編集モーダルがそのまま結果発表に使われる」のは体験として噛み合わないと判明。以下に変更する。

- 結果は編集モーダルとは別の専用コンポーネントで表示する
- 表示内容：ゲームタイトル＋「プレイ開始」ボタン（押すと `status` を `playing` に変更）＋「閉じる」ボタン
- 編集・削除は今まで通り一覧のカードをクリックして `GameModal` から行う（変更なし）

## 設計

### 状態（`GameListPage.jsx` に追加）

| state | 役割 |
|---|---|
| `isPicking` | 演出中かどうかの真偽値 |
| `pickingTitle` | 演出中にパラパラ表示するタイトル文字列 |

### 動作フロー

1. ヘッダーの「ランダム選出」ボタンをクリック
2. `handleRandomPick()` 実行
   - `games` を `status === "unplayed"` で絞り込み
   - `isPicking = true` にする
   - `setInterval` で一定間隔（100ms目安）ごとに `pickingTitle` をランダムな未プレイタイトルへ切り替える
   - 一定時間（1.2秒目安）後に `clearInterval` し、最終的に1本をランダム確定して `setSelectedGame()` にセット、`isPicking = false`
3. `isPicking` が true の間は `RandomPickOverlay` を表示。false に戻ると同時に `selectedGame` がセットされているため、既存の `GameModal` が開く

### コンポーネント変更

| ファイル | 変更内容 |
|---|---|
| `src/components/Header.jsx` | 「ランダム選出」ボタンを追加。props `onRandomPick`・`randomPickDisabled` を新規に受け取る |
| `src/pages/GameListPage.jsx` | `isPicking`・`pickingTitle`・`pickedGame` の state、`handleRandomPick` 関数、`RandomPickOverlay`・`RandomPickResult` の条件付きレンダーを追加 |
| `src/components/RandomPickOverlay.jsx`（新規） | 演出中に表示する見た目専用コンポーネント。`pickingTitle` を受け取って表示するだけ（ロジックは持たない） |
| `src/components/RandomPickResult.jsx`（新規） | 抽選結果を表示する専用コンポーネント。タイトル表示＋「プレイ開始」＋「閉じる」 |
| `src/hooks/useGames.js` | 変更なし（データ取得・更新の責務とは無関係） |

### ボタンの disabled 条件

以下のどちらかを満たすとき disabled：
- 未プレイのゲームが0件
- 演出中（`isPicking === true`、連打防止）

## スコープ外

- ランダム選出の対象を「現在のフィルタ」に連動させること（フィルタに関係なく常に全未プレイから選ぶ）
- 演出のアニメーション細部（具体的なTailwindクラスの選定）は実装時に決める
