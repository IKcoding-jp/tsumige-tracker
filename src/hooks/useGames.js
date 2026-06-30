import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export function useGames(session) {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  async function run(fn, errorMessage) {
    try {
      const { error } = await fn();
      if (error) throw error;
      fetchGames();
    } catch (e) {
      console.error(e);
      setError(errorMessage);
    }
  }

  async function fetchGames() {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setGames(data ?? []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError("データの取得に失敗しました");
      setLoading(false);
    }
  }

  async function addGame({ title, platform }) {
    await run(
      () =>
        supabase.from("games").insert({
          title,
          user_id: session.user.id,
          status: "unplayed",
          platform: platform || null,
        }),
      "ゲームの追加に失敗しました",
    );
  }

  async function deleteGame(id) {
    await run(
      () => supabase.from("games").delete().eq("id", id),
      "削除に失敗しました",
    );
  }
  async function updateGame(id, title) {
    await run(
      () => supabase.from("games").update({ title }).eq("id", id),
      "更新に失敗しました",
    );
  }
  async function updateStatus(id, status) {
    await run(
      () => supabase.from("games").update({ status }).eq("id", id),
      "ステータスの更新に失敗しました",
    );
  }
  useEffect(() => {
    fetchGames();
  }, []);
  return {
    games,
    loading,
    error,
    addGame,
    deleteGame,
    updateGame,
    updateStatus,
  };
}
