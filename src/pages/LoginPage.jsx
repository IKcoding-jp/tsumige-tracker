import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { isLoading, error, login, signUp } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await login(email, password);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">ツミゲリスト</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="border rounded px-3 py-2"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
          </Button>
        </form>
        <Button
          variant="ghost"
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-gray-500"
        >
          {isSignUp ? "ログインはこちら" : "新規登録はこちら"}
        </Button>
        <p className="text-red-500 text-sm mt-2 min-h-[1.25rem]">{error}</p>
      </div>
    </div>
  );
}

export default LoginPage;
