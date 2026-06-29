import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { Button } from "@/components/ui/button";
import GameCard from "../components/GameCard";
import GameModal from "../components/GameModal";

function GameListPage({ session }) {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  async function handleSignOut() {
    await supabase.auth.signOut();
  }
  async function fetchGames() {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: true });
    setGames(data ?? []);
  }
  async function addGame(e) {
    e.preventDefault();
    if (!title) return;
    await supabase.from("games").insert({
      title,
      user_id: session.user.id,
      status: "unplayed",
    });
    setTitle("");
    fetchGames();
  }
  async function deleteGame(id) {
    await supabase.from("games").delete().eq("id", id);
    fetchGames();
  }
  async function updateGame(id) {
    await supabase.from("games").update({ title: editingTitle }).eq("id", id);
    setEditingId(null);
    fetchGames();
  }
  async function updateStatus(id, status) {
    await supabase.from("games").update({ status }).eq("id", id);
    fetchGames();
  }
  useEffect(() => {
    fetchGames();
  }, []);
  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ツミゲ</h1>
        <Button variant="outline" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>
      <form onSubmit={addGame} className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ゲームタイトル"
          className="border rounded px-3 py-2 flex-1"
        />
        <Button type="submit">追加</Button>
      </form>
      <div className="space-y-2">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onStatusChange={updateStatus}
            onEdit={() => {
              setEditingId(game.id);
              setEditingTitle(game.title);
            }}
            onDelete={deleteGame}
          />
        ))}
      </div>
      {editingId !== null && (
        <GameModal
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onCancel={() => setEditingId(null)}
          onSave={() => updateGame(editingId)}
        />
      )}
    </div>
  );
}

export default GameListPage;
