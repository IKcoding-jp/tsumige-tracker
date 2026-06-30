import { useState, useEffect } from "react";
import supabase from "./lib/supabase";
import LoginPage from "./pages/LoginPage";
import GameListPage from "./pages/GameListPage";

function App() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (session === undefined) return null;
  if (!session) {
    return <LoginPage />;
  }
  return <GameListPage session={session} />;
}

export default App;
