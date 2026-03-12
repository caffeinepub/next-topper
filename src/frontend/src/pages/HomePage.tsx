import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Heart,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import LoginButton from "../components/LoginButton";
import { BATCHES } from "../data/batches";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useResetAndClaimAdmin,
} from "../hooks/useQueries";

interface HomePageProps {
  navigate: (page: AppPage) => void;
}

export default function HomePage({ navigate }: HomePageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const resetAndClaimAdmin = useResetAndClaimAdmin();

  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  const handleBecomeAdmin = async () => {
    try {
      await resetAndClaimAdmin.mutateAsync();
      toast.success("Admin access granted! Click the Admin Panel button.");
    } catch {
      toast.error("Failed to get admin access. Try again.");
    }
  };

  const handleAdminAccessClick = () => {
    setAdminPasswordInput("");
    setAdminPasswordError("");
    setShowAdminPasswordDialog(true);
  };

  const handleAdminPasswordSubmit = async () => {
    if (adminPasswordInput === "julfiquar") {
      setShowAdminPasswordDialog(false);
      setAdminPasswordInput("");
      setAdminPasswordError("");
      await handleBecomeAdmin();
    } else {
      setAdminPasswordError("Incorrect password");
    }
  };

  const handleDialogClose = () => {
    setShowAdminPasswordDialog(false);
    setAdminPasswordInput("");
    setAdminPasswordError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin Password Dialog */}
      <Dialog open={showAdminPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-sm" data-ocid="admin_access.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Shield className="h-5 w-5 text-primary" />
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground font-body">
              Enter the admin password to continue.
            </p>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  if (adminPasswordError) setAdminPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdminPasswordSubmit();
                }}
                className="font-body"
                data-ocid="admin_access.input"
                autoFocus
              />
              {adminPasswordError && (
                <p
                  className="text-sm text-destructive font-body"
                  data-ocid="admin_access.error_state"
                >
                  {adminPasswordError}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="font-display"
                data-ocid="admin_access.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminPasswordSubmit}
                disabled={resetAndClaimAdmin.isPending}
                className="font-display"
                data-ocid="admin_access.confirm_button"
              >
                {resetAndClaimAdmin.isPending ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/logo-icon-transparent.dim_120x120.png"
              alt="Next Topper"
              className="h-9 w-9 object-contain"
            />
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                Next Topper
              </span>
              <span className="text-xs text-muted-foreground font-body hidden sm:block">
                Your path to top ranks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground font-body hidden sm:block">
                👋 {userProfile.name}
              </span>
            )}
            {isAuthenticated && !adminLoading && isAdmin && (
              <Button
                onClick={() => navigate({ name: "admin" })}
                size="sm"
                variant="outline"
                className="gap-2 font-display font-medium border-primary/30 text-primary hover:bg-primary/10"
                data-ocid="header.admin_panel.button"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Button>
            )}
            {isAuthenticated && !adminLoading && !isAdmin && (
              <Button
                onClick={handleAdminAccessClick}
                size="sm"
                variant="ghost"
                disabled={resetAndClaimAdmin.isPending}
                className="gap-2 font-display font-medium text-muted-foreground hover:text-primary text-xs"
                data-ocid="header.become_admin.button"
              >
                <Shield className="h-3 w-3" />
                {resetAndClaimAdmin.isPending
                  ? "Getting access..."
                  : "Admin Access"}
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-foreground text-background py-16 sm:py-24 grain">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10"
            style={{ background: "var(--grad-saffron)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 -translate-x-1/2 translate-y-1/2"
            style={{ background: "var(--grad-teal)" }}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 font-body text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                🚀 Classes 6–12 + JEE + NEET
              </Badge>
              <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
                <span className="block">Study Smart,</span>
                <span className="shimmer-text block">Rank Higher.</span>
              </h1>
              <p className="text-background/70 font-body text-lg sm:text-xl mb-8 max-w-xl leading-relaxed">
                Premium video lessons for Class 6 to 12 and NEET aspirants.
                Learn from expert educators and ace your exams.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    document
                      .getElementById("batches")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-display font-semibold bg-primary text-primary-foreground px-6 shadow-glow hover:opacity-90"
                >
                  Explore Batches
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 relative z-10">
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: BookOpen, value: "9", label: "Batches" },
                { icon: GraduationCap, value: "6–12", label: "Classes" },
                { icon: Users, value: "JEE+NEET", label: "Entrance Prep" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-1">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="font-display font-bold text-xl text-background">
                    {value}
                  </div>
                  <div className="font-body text-xs text-background/60">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="batches" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 animate-fade-up">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
                Choose Your Batch
              </h2>
              <p className="text-muted-foreground font-body max-w-xl mx-auto">
                Select your class or competitive exam below to access curated
                video lessons.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {BATCHES.map((batch, index) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() =>
                    navigate({
                      name: "batch",
                      batchId: batch.id,
                      batchLabel: batch.label,
                    })
                  }
                  className={`
                    animate-fade-up animate-fade-up-delay-${Math.min(index + 1, 8)}
                    group relative overflow-hidden rounded-2xl p-5 text-left
                    transition-all duration-300
                    hover:scale-[1.03] hover:shadow-card-hover
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    shadow-card cursor-pointer
                    ${batch.cardClass}
                  `}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                      <span className="text-2xl">{batch.emoji}</span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight text-shadow-sm">
                      {batch.label}
                    </h3>
                    <p className="font-body text-white/80 text-xs mt-1 leading-relaxed text-shadow-sm">
                      {batch.description}
                    </p>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/40 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎥",
                  title: "HD Video Lessons",
                  desc: "Expert-recorded lessons in crisp HD quality for distraction-free learning.",
                },
                {
                  icon: "⚡",
                  title: "Instant Access",
                  desc: "Log in once and access all your batch content anytime, anywhere.",
                },
                {
                  icon: "🏆",
                  title: "Exam Focused",
                  desc: "Every lesson is crafted to align with board and entrance exam patterns.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="text-3xl shrink-0">{icon}</div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">
                      {title}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <div className="max-w-lg mx-auto">
                <Star className="h-8 w-8 text-primary mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-3">
                  Start Learning Today
                </h2>
                <p className="text-muted-foreground font-body mb-6">
                  Log in with Internet Identity to track your progress and
                  access all batch content.
                </p>
                <div className="flex justify-center">
                  <LoginButton />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-8 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/logo-icon-transparent.dim_120x120.png"
              alt="Next Topper"
              className="h-6 w-6 object-contain opacity-60"
            />
            <span className="font-display font-semibold text-sm text-foreground">
              Next Topper
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart className="h-3.5 w-3.5 text-primary fill-primary inline" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
