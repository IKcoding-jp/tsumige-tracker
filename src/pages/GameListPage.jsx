import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/utils/status";
import supabase from "../lib/supabase";
import GameCard from "../components/GameCard";
import GameModal from "../components/GameModal";
import Header from "../components/Header";

const PLATFORMS = ["Switch", "PS5", "PS4", "Steam", "PC", "スマホ", "その他"];

function GameListPage({ session }) {
  const [games, setGames] = useState([]);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
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
      platform: platform || null,
    });
    setTitle("");
    setPlatform("");
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
  const visibleGames = games.filter((game) => {
    const statusOk = filter === "all" || game.status === filter;

    const platformOk =
      platformFilter === "all" ||
      (platformFilter === "unset"
        ? !game.platform
        : game.platform === platformFilter);

    return statusOk && platformOk;
  });
  return (
    <div className="max-w-xl mx-auto p-8">
      <Header onSignOut={handleSignOut} />
      <form onSubmit={addGame} className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ゲームタイトル"
          className="border rounded-lg px-3 h-8 flex-1"
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border rounded-lg px-3 h-8"
        >
          <option value="">未設定</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Button type="submit">追加</Button>
      </form>
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          すべて
        </Button>
        {Object.entries(STATUS).map(([key, { label }]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="border rounded-lg px-3 h-8"
        >
          <option value="all">すべて</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value="unset">未設定</option>
        </select>
      </div>
      <div className="space-y-2">
        {visibleGames.map((game) => (
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
