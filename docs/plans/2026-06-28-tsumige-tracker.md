# 積みゲートラッカー 実装計画

> **学習スタイル:** Claude がチャット内でコードを小さく出す → IK が理解しながら写経 → ブラウザで確認 → コミット の繰り返し。

**Goal:** React + Supabase で「積みゲーの一覧管理＋認証」が動く Web アプリを作る

**Architecture:** Supabase を BaaS（認証＋DB）として使い、フロントエンドは React SPA で構成。認証状態は App.jsx のトップで管理し、ログイン済みかどうかで表示画面を切り替える。

**Tech Stack:** React 18, Vite, Supabase JS v2, JavaScript（TypeScript なし）

## Global Constraints

- JavaScript のみ（TypeScript 禁止）
- 関数コンポーネント＋フックのみ（クラスコンポーネント禁止）
- `.jsx` 拡張子をコンポーネントに使う
- コメントは日本語
- Supabase JS: `@supabase/supabase-js` v2

---

## ファイル構成

```
tsumige-tracker/
├── .env.local                    # Supabase の URL・APIキー（Git 管理外）
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                  # エントリーポイント・React をマウント
    ├── App.jsx                   # 認証状態で画面切り替え
    ├── lib/
    │   └── supabase.js           # Supabase クライアントの初期化
    ├── pages/
    │   ├── LoginPage.jsx         # ログイン・新規登録画面
    │   └── GameListPage.jsx      # ゲーム一覧画面（メイン）
    └── components/
        ├── Header.jsx            # タイトル＋ログアウトボタン
        ├── FilterBar.jsx         # ステータスで絞り込むタブ
        ├── GameCard.jsx          # ゲーム1枚のカード表示
        └── GameModal.jsx         # 追加・編集フォームのモーダル
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: プロジェクト全体（Vite scaffold）
- Create: `.gitignore`
- Create: `.env.local`

- [ ] **Step 1: Vite + React プロジェクトを作成する**

```bash
npm create vite@latest tsumige-tracker -- --template react
cd tsumige-tracker
npm install
```

- [ ] **Step 2: 不要なファイルを削除する**

Vite のテンプレートに含まれる不要ファイルを削除：
```
src/App.css
src/assets/react.svg
public/vite.svg
```

- [ ] **Step 3: Supabase パッケージをインストールする**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 4: `.env.local` を作る（中身は Task 2 で書く）**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 5: Git を初期化してコミットする**

```bash
git init
git add .
git commit -m "feat: Vite + React プロジェクト初期化"
```

**確認:** `npm run dev` でブラウザに Vite のデフォルト画面が表示される

---

## Task 2: Supabase セットアップ（DB・RLS）

**Files:**
- Supabase ダッシュボード上の操作（コードファイルなし）
- Modify: `.env.local`

- [ ] **Step 1: Supabase プロジェクトを作成する**

supabase.com → New Project → 名前: tsumige-tracker・リージョン: Northeast Asia (Tokyo)

- [ ] **Step 2: games テーブルを作成する**

Supabase ダッシュボード → Table Editor → New Table

```sql
create table games (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  platform text not null,
  status text not null default 'backlog',
  rating integer check (rating >= 1 and rating <= 5),
  priority integer not null default 2,
  memo text,
  created_at timestamp with time zone default now()
);
```

- [ ] **Step 3: RLS を有効化する**

```sql
-- RLS を有効化
alter table games enable row level security;

-- 自分のレコードのみ参照できる
create policy "ユーザーは自分のゲームを参照できる"
  on games for select
  using (auth.uid() = user_id);

-- 自分のレコードのみ追加できる
create policy "ユーザーは自分のゲームを追加できる"
  on games for insert
  with check (auth.uid() = user_id);

-- 自分のレコードのみ更新できる
create policy "ユーザーは自分のゲームを更新できる"
  on games for update
  using (auth.uid() = user_id);

-- 自分のレコードのみ削除できる
create policy "ユーザーは自分のゲームを削除できる"
  on games for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 4: `.env.local` に接続情報を書く**

Supabase ダッシュボード → Settings → API から取得：
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（anon public キー）
```

**確認:** Supabase の Table Editor で games テーブルが表示されている

---

## Task 3: Supabase クライアント

**Files:**
- Create: `src/lib/supabase.js`

- [ ] **Step 1: `src/lib/supabase.js` を書く**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: コミットする**

```bash
git add src/lib/supabase.js .env.local
git commit -m "feat: Supabase クライアント追加"
```

**確認:** エラーなく `npm run dev` が起動する

---

## Task 4: ログイン画面

**Files:**
- Create: `src/pages/LoginPage.jsx`

- [ ] **Step 1: `src/pages/LoginPage.jsx` を書く**

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
  }

  return (
    <div>
      <h1>積みゲートラッカー</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isSignUp ? '新規登録' : 'ログイン'}</button>
      </form>
      {error && <p>{error}</p>}
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'ログインに切り替え' : '新規登録に切り替え'}
      </button>
    </div>
  )
}

export default LoginPage
```

- [ ] **Step 2: コミットする**

```bash
git add src/pages/LoginPage.jsx
git commit -m "feat: ログイン画面を追加"
```

**確認:** 次の Task 5 で App.jsx に組み込んだ後にブラウザ確認する

---

## Task 5: 認証状態管理・画面切り替え

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: `src/App.jsx` を書く**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import GameListPage from './pages/GameListPage'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期ロード時に現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p>読み込み中...</p>

  return session ? <GameListPage session={session} /> : <LoginPage />
}

export default App
```

- [ ] **Step 2: `src/main.jsx` を書く**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: コミットする**

```bash
git add src/App.jsx src/main.jsx
git commit -m "feat: 認証状態で画面を切り替える"
```

**確認:**
- ブラウザでログインフォームが表示される
- 正しいメール・パスワードでログインすると「読み込み中...」の後に画面が切り替わる（GameListPage はまだ空でよい）
- Supabase ダッシュボード → Authentication → Users にユーザーが登録されている

---

## Task 6: ゲーム一覧取得・表示

**Files:**
- Create: `src/pages/GameListPage.jsx`

- [ ] **Step 1: `src/pages/GameListPage.jsx` を書く（一覧取得のみ）**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function GameListPage({ session }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setGames(data)
      }
      setLoading(false)
    }

    fetchGames()
  }, [])

  if (loading) return <p>読み込み中...</p>

  return (
    <div>
      <h1>ゲーム一覧</h1>
      {games.length === 0 ? (
        <p>ゲームがまだありません</p>
      ) : (
        games.map((game) => (
          <div key={game.id}>
            <p>{game.title}</p>
            <p>{game.platform}</p>
            <p>{game.status}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default GameListPage
```

- [ ] **Step 2: コミットする**

```bash
git add src/pages/GameListPage.jsx
git commit -m "feat: ゲーム一覧の取得と表示"
```

**確認:**
- ログイン後にゲーム一覧ページが表示される
- Supabase にテストデータを手動で入れると一覧に表示される

---

## Task 7: GameCard コンポーネント

**Files:**
- Create: `src/components/GameCard.jsx`
- Modify: `src/pages/GameListPage.jsx`

- [ ] **Step 1: `src/components/GameCard.jsx` を書く**

```jsx
// ステータスを日本語に変換するマップ
const STATUS_LABEL = {
  backlog: '積み中',
  playing: 'プレイ中',
  completed: 'クリア済み',
}

const PRIORITY_LABEL = {
  1: '高',
  2: '中',
  3: '低',
}

function GameCard({ game, onClick }) {
  return (
    <div onClick={() => onClick(game)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '12px', marginBottom: '8px' }}>
      <h3>{game.title}</h3>
      <p>プラットフォーム: {game.platform}</p>
      <p>ステータス: {STATUS_LABEL[game.status]}</p>
      <p>優先度: {PRIORITY_LABEL[game.priority]}</p>
      {game.rating && <p>評価: {'★'.repeat(game.rating)}</p>}
      {game.memo && <p>{game.memo}</p>}
    </div>
  )
}

export default GameCard
```

- [ ] **Step 2: `GameListPage.jsx` で GameCard を使うように書き換える**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import GameCard from '../components/GameCard'

function GameListPage({ session }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setGames(data)
      }
      setLoading(false)
    }

    fetchGames()
  }, [])

  function handleCardClick(game) {
    console.log('クリックされたゲーム:', game)
  }

  if (loading) return <p>読み込み中...</p>

  return (
    <div>
      <h1>ゲーム一覧</h1>
      {games.length === 0 ? (
        <p>ゲームがまだありません</p>
      ) : (
        games.map((game) => (
          <GameCard key={game.id} game={game} onClick={handleCardClick} />
        ))
      )}
    </div>
  )
}

export default GameListPage
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/GameCard.jsx src/pages/GameListPage.jsx
git commit -m "feat: GameCard コンポーネントを追加"
```

**確認:** ゲームカードがブラウザに表示される・クリックするとコンソールにゲームデータが出る

---

## Task 8: Header コンポーネント

**Files:**
- Create: `src/components/Header.jsx`
- Modify: `src/pages/GameListPage.jsx`

- [ ] **Step 1: `src/components/Header.jsx` を書く**

```jsx
import { supabase } from '../lib/supabase'

function Header() {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
      <h1>積みゲートラッカー</h1>
      <button onClick={handleLogout}>ログアウト</button>
    </header>
  )
}

export default Header
```

- [ ] **Step 2: `GameListPage.jsx` に Header を追加する**

```jsx
import Header from '../components/Header'
// ... 他のimportはそのまま

function GameListPage({ session }) {
  // ... stateはそのまま

  return (
    <div>
      <Header />
      {/* ... 残りはそのまま */}
    </div>
  )
}
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/Header.jsx src/pages/GameListPage.jsx
git commit -m "feat: Header とログアウト機能を追加"
```

**確認:** ログアウトボタンを押すとログイン画面に戻る

---

## Task 9: FilterBar コンポーネント

**Files:**
- Create: `src/components/FilterBar.jsx`
- Modify: `src/pages/GameListPage.jsx`

- [ ] **Step 1: `src/components/FilterBar.jsx` を書く**

```jsx
const FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'backlog', label: '積み中' },
  { value: 'playing', label: 'プレイ中' },
  { value: 'completed', label: 'クリア済み' },
]

function FilterBar({ current, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          style={{ fontWeight: current === filter.value ? 'bold' : 'normal' }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
```

- [ ] **Step 2: `GameListPage.jsx` にフィルター機能を追加する**

```jsx
import FilterBar from '../components/FilterBar'
// ... 他のimportはそのまま

function GameListPage({ session }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')  // 追加

  // ... fetchGames はそのまま

  // フィルター後のゲームリストを計算
  const filteredGames = filter === 'all'
    ? games
    : games.filter((game) => game.status === filter)

  return (
    <div>
      <Header />
      <FilterBar current={filter} onChange={setFilter} />  {/* 追加 */}
      {filteredGames.length === 0 ? (
        <p>ゲームがありません</p>
      ) : (
        filteredGames.map((game) => (
          <GameCard key={game.id} game={game} onClick={handleCardClick} />
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/FilterBar.jsx src/pages/GameListPage.jsx
git commit -m "feat: FilterBar でステータス絞り込みを追加"
```

**確認:** タブを切り替えると表示されるゲームが変わる

---

## Task 10: ゲーム追加・編集・削除（GameModal）

**Files:**
- Create: `src/components/GameModal.jsx`
- Modify: `src/pages/GameListPage.jsx`

- [ ] **Step 1: `src/components/GameModal.jsx` を書く**

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const INITIAL_FORM = {
  title: '',
  platform: '',
  status: 'backlog',
  rating: '',
  priority: 2,
  memo: '',
}

function GameModal({ game, onClose, onSaved }) {
  // 編集の場合は既存データ・追加の場合は空のフォーム
  const [form, setForm] = useState(game ? { ...game } : INITIAL_FORM)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (game) {
      // 編集
      const { error } = await supabase
        .from('games')
        .update({ ...form })
        .eq('id', game.id)
      if (error) console.error(error)
    } else {
      // 追加
      const { error } = await supabase
        .from('games')
        .insert([{ ...form }])
      if (error) console.error(error)
    }

    setLoading(false)
    onSaved()
  }

  async function handleDelete() {
    if (!confirm('削除しますか？')) return
    setLoading(true)
    const { error } = await supabase.from('games').delete().eq('id', game.id)
    if (error) console.error(error)
    setLoading(false)
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '24px', width: '400px' }}>
        <h2>{game ? 'ゲームを編集' : 'ゲームを追加'}</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="タイトル" value={form.title} onChange={handleChange} required />
          <input name="platform" placeholder="プラットフォーム" value={form.platform} onChange={handleChange} required />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="backlog">積み中</option>
            <option value="playing">プレイ中</option>
            <option value="completed">クリア済み</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value={1}>優先度: 高</option>
            <option value={2}>優先度: 中</option>
            <option value={3}>優先度: 低</option>
          </select>
          <select name="rating" value={form.rating} onChange={handleChange}>
            <option value="">評価なし</option>
            <option value={1}>★</option>
            <option value={2}>★★</option>
            <option value={3}>★★★</option>
            <option value={4}>★★★★</option>
            <option value={5}>★★★★★</option>
          </select>
          <textarea name="memo" placeholder="メモ" value={form.memo} onChange={handleChange} />
          <button type="submit" disabled={loading}>
            {game ? '更新' : '追加'}
          </button>
          {game && (
            <button type="button" onClick={handleDelete} disabled={loading}>
              削除
            </button>
          )}
          <button type="button" onClick={onClose}>キャンセル</button>
        </form>
      </div>
    </div>
  )
}

export default GameModal
```

- [ ] **Step 2: `GameListPage.jsx` にモーダルを組み込む**

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import FilterBar from '../components/FilterBar'
import GameCard from '../components/GameCard'
import GameModal from '../components/GameModal'

function GameListPage({ session }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)  // 編集対象
  const [showModal, setShowModal] = useState(false)        // モーダル表示フラグ

  async function fetchGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setGames(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGames()
  }, [])

  function handleCardClick(game) {
    setSelectedGame(game)
    setShowModal(true)
  }

  function handleAddClick() {
    setSelectedGame(null)
    setShowModal(true)
  }

  function handleModalClose() {
    setShowModal(false)
    setSelectedGame(null)
  }

  async function handleSaved() {
    handleModalClose()
    await fetchGames()  // 保存後に一覧を再取得
  }

  const filteredGames = filter === 'all'
    ? games
    : games.filter((game) => game.status === filter)

  if (loading) return <p>読み込み中...</p>

  return (
    <div>
      <Header />
      <FilterBar current={filter} onChange={setFilter} />
      <button onClick={handleAddClick}>＋ ゲームを追加</button>
      {filteredGames.length === 0 ? (
        <p>ゲームがありません</p>
      ) : (
        filteredGames.map((game) => (
          <GameCard key={game.id} game={game} onClick={handleCardClick} />
        ))
      )}
      {showModal && (
        <GameModal
          game={selectedGame}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

export default GameListPage
```

- [ ] **Step 3: コミットする**

```bash
git add src/components/GameModal.jsx src/pages/GameListPage.jsx
git commit -m "feat: ゲームの追加・編集・削除機能を追加"
```

**確認:**
- 「＋ ゲームを追加」ボタンでモーダルが開く
- フォームに入力して追加すると一覧に反映される
- カードをクリックするとそのゲームの編集モーダルが開く
- 削除ボタンで削除できる

---

## 完了チェックリスト

- [ ] ログイン・新規登録ができる
- [ ] ログアウトができる
- [ ] ゲームを追加できる
- [ ] ゲームの一覧が表示される
- [ ] ステータスで絞り込みができる
- [ ] ゲームを編集できる
- [ ] ゲームを削除できる
- [ ] 他人のデータが見えないこと（RLS）
