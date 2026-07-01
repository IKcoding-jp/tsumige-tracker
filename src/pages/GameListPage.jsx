import { useState } from "react";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/utils/status";
import { PLATFORM } from "@/utils/platform";
import { useGames } from "../hooks/useGames";
import GameCard from "../components/GameCard";
import GameModal from "../components/GameModal";
import Header from "../components/Header";
import supabase from "../lib/supabase";
import EmptyState from "../components/EmptyState";
import RandomPickOverlay from "../components/RandomPickOverlay";
import RandomPickResult from "../components/RandomPickResult";

function GameListPage({ session }) {
  const {
    games,
    loading,
    error,
    addGame,
    deleteGame,
    updateGame,
    updateStatus,
  } = useGames(session);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [isPicking, setIsPicking] = useState(false);
  const [pickingTitle, setPickingTitle] = useState("");
  const [pickedGame, setPickedGame] = useState(null);
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleAddGame(e) {
    e.preventDefault();
    if (!title) return;
    await addGame({ title, platform });
    setTitle("");
    setPlatform("");
  }

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
      setPickedGame(unplayedGames[randomIndex]);
      setIsPicking(false);
    }, 1200);
  }

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
      <Header
        onSignOut={handleSignOut}
        onRandomPick={handleRandomPick}
        randomPickDisabled={
          isPicking || !games.some((game) => game.status === "unplayed")
        }
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleAddGame} className="flex gap-2 mb-4">
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
          {Object.keys(PLATFORM).map((p) => (
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
          {Object.keys(PLATFORM).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value="unset">未設定</option>
        </select>
      </div>
      <div className="space-y-2">
        {!loading && visibleGames.length === 0 && (
          <EmptyState type={games.length === 0 ? "no-games" : "no-results"} />
        )}
        {visibleGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onStatusChange={updateStatus}
            onClick={() => setSelectedGame(game)}
          />
        ))}
      </div>
      {isPicking && <RandomPickOverlay title={pickingTitle} />}
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
      {selectedGame !== null && (
        <GameModal
          game={selectedGame}
          onSave={(id, title) => {
            updateGame(id, title);
            setSelectedGame(null);
          }}
          onDelete={(id) => {
            deleteGame(id);
            setSelectedGame(null);
          }}
          onCancel={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}

export default GameListPage;
