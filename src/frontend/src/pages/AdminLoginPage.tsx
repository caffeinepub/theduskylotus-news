import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { createActorWithConfig } from "../config";
import {
  deriveIdentityFromPassword,
  useAdminPassword,
} from "../hooks/useAdminPassword";
import { getSecretParameter } from "../utils/urlParams";

const ADMIN_PASSWORD = "fortes fortuna adiuvat";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, logout, isAuthenticated } = useAdminPassword();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    // Check password locally -- no backend call needed
    if (password !== ADMIN_PASSWORD) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Derive the deterministic admin identity from the password
      const identity = await deriveIdentityFromPassword(password);
      const actor = await createActorWithConfig({ agentOptions: { identity } });

      // If the Caffeine admin token is present in the URL, use it to register
      // this identity as admin in the backend (one-time setup).
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      if (adminToken) {
        try {
          await actor._initializeAccessControlWithSecret(adminToken);
        } catch {
          // Already initialized -- safe to ignore
        }
      }

      // Save the session and clear all cached queries so useActor re-creates with the new identity
      login(password);
      await queryClient.cancelQueries();
      queryClient.clear();
      navigate({ to: "/admin/dashboard" });
    } catch {
      logout();
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-hero border border-border p-10 w-full max-w-sm"
        data-ocid="admin.card"
      >
        <div className="text-center mb-8">
          <img
            src="/assets/uploads/screenshot_2026-03-22_at_7.58.09_pm-019d256a-3ee1-708b-bc1a-477f90be7473-1.png"
            alt="The Dusky Lotus"
            className="h-16 w-16 object-contain rounded-full mx-auto mb-4 bg-white p-1"
          />
          <h1 className="font-editorial text-2xl font-bold text-foreground mb-1">
            Admin Access
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            TheDuskyLotus.News editorial dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="font-body text-sm text-foreground"
            >
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value="admin"
                disabled
                className="pl-9 font-body bg-muted/50 text-muted-foreground border-border"
                data-ocid="admin.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-body text-sm text-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pl-9 pr-10 font-body border-border"
                autoFocus
                data-ocid="admin.input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="p-3 bg-destructive/10 rounded-xl border border-destructive/20"
              data-ocid="admin.error_state"
            >
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-gold text-primary-foreground hover:bg-gold/90 font-body rounded-full h-11"
            data-ocid="admin.primary_button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
