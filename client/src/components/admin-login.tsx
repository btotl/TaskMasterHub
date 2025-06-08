import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      onSuccess();
      toast({ title: "Login successful!" });
    } catch (error) {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white brutal-card p-8 max-w-md mx-4">
        <h3 className="text-2xl font-brutal font-black mb-6">ADMIN LOGIN</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label className="block text-lg font-bold mb-2">USERNAME</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full brutal-input p-3 font-mono"
              readOnly
            />
          </div>
          <div className="mb-6">
            <Label className="block text-lg font-bold mb-2">PASSWORD</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full brutal-input p-3 font-mono"
            />
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoggingIn || !password}
              className="brutal-button bg-brutal-green px-6 py-3 font-bold flex-1"
            >
              {isLoggingIn ? "LOGGING IN..." : "LOGIN"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="brutal-button bg-white px-6 py-3 font-bold flex-1"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
