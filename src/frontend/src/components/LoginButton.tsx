import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isAuthenticated) {
    return (
      <Button
        onClick={handleAuth}
        variant="outline"
        size="sm"
        className="gap-2 font-display font-medium border-border hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      size="sm"
      className="gap-2 font-display font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
    >
      {isLoggingIn ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {isLoggingIn ? "Logging in..." : "Login"}
    </Button>
  );
}
