import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Film,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { ExternalBlob } from "../backend";
import type { Video } from "../backend.d";
import LoginButton from "../components/LoginButton";
import { BATCHES } from "../data/batches";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddVideo,
  useCheckAdminPassword,
  useDeleteVideo,
  useGetCallerUserProfile,
  useGetVideosByBatch,
  useIsCallerAdmin,
  useSetAdminPassword,
} from "../hooks/useQueries";

interface AdminPageProps {
  navigate: (page: AppPage) => void;
}

// Encoding: "title||blobUrl||type" where type is "video" or "pdf"
function parseVideoTitle(raw: string): {
  title: string;
  blobId: string | null;
  fileType: "video" | "pdf";
} {
  const parts = raw.split("||");
  if (parts.length >= 3) {
    const type = parts[parts.length - 1] === "pdf" ? "pdf" : "video";
    const blobId = parts[parts.length - 2];
    const title = parts.slice(0, parts.length - 2).join("||");
    return { title, blobId, fileType: type };
  }
  if (parts.length === 2) {
    return { title: parts[0], blobId: parts[1], fileType: "video" };
  }
  return { title: raw, blobId: null, fileType: "video" };
}

function BatchVideoRows({
  navigate,
  onDelete,
  isDeleting,
  deletingId,
}: {
  navigate: (page: AppPage) => void;
  onDelete: (id: bigint, batchId: string, title: string) => void;
  isDeleting: boolean;
  deletingId: bigint | null;
}) {
  const q0 = useGetVideosByBatch(BATCHES[0].id);
  const q1 = useGetVideosByBatch(BATCHES[1].id);
  const q2 = useGetVideosByBatch(BATCHES[2].id);
  const q3 = useGetVideosByBatch(BATCHES[3].id);
  const q4 = useGetVideosByBatch(BATCHES[4].id);
  const q5 = useGetVideosByBatch(BATCHES[5].id);
  const q6 = useGetVideosByBatch(BATCHES[6].id);
  const q7 = useGetVideosByBatch(BATCHES[7].id);
  const q8 = useGetVideosByBatch(BATCHES[8]?.id ?? "");

  const queries = [q0, q1, q2, q3, q4, q5, q6, q7, q8];
  const isLoadingAny = queries.some((q) => q.isLoading);
  const allVideos = queries.flatMap((q, i) =>
    BATCHES[i]
      ? (q.data ?? []).map((v: Video) => ({ ...v, batch: BATCHES[i] }))
      : [],
  );

  if (isLoadingAny) {
    return (
      <>
        {(["l1", "l2", "l3"] as const).map((k) => (
          <TableRow key={k}>
            <TableCell colSpan={4}>
              <Skeleton className="h-8 w-full rounded" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  if (allVideos.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-12">
          <Film className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="font-display font-medium text-foreground text-sm">
            No files uploaded yet
          </p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Use the upload form above to add videos or PDFs.
          </p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {allVideos.map((item) => {
        const { title, blobId, fileType } = parseVideoTitle(item.title);
        const isCurrentlyDeleting = isDeleting && deletingId === item.id;
        return (
          <TableRow
            key={item.id.toString()}
            className="group hover:bg-secondary/30"
            data-ocid="admin.video.row"
          >
            <TableCell className="font-body font-medium max-w-[200px] truncate">
              <div className="flex items-center gap-2">
                {fileType === "pdf" ? (
                  <FileText className="h-4 w-4 text-orange-500 shrink-0" />
                ) : (
                  <Film className="h-4 w-4 text-primary shrink-0" />
                )}
                {title}
              </div>
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    name: "batch",
                    batchId: item.batch.id,
                    batchLabel: item.batch.label,
                  })
                }
                className="focus:outline-none"
              >
                <Badge
                  className={`text-white border-0 text-xs cursor-pointer hover:opacity-80 ${item.batch.cardClass}`}
                >
                  {item.batch.emoji} {item.batch.label}
                </Badge>
              </button>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {blobId ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-body">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {fileType === "pdf" ? "PDF Ready" : "Video Ready"}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground font-body">
                  No file
                </span>
              )}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item.id, item.batch.id, title)}
                disabled={isCurrentlyDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                data-ocid="admin.video.delete_button"
              >
                {isCurrentlyDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

function AllVideosTable({ navigate }: { navigate: (page: AppPage) => void }) {
  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideo();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleDelete = (id: bigint, batchId: string, title: string) => {
    setDeletingId(id);
    deleteVideo(
      { id, batchId },
      {
        onSuccess: () => {
          toast.success(`"${title}" deleted.`);
          setDeletingId(null);
        },
        onError: (e) => {
          toast.error(`Failed to delete: ${(e as Error).message}`);
          setDeletingId(null);
        },
      },
    );
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="font-display font-semibold">Title</TableHead>
            <TableHead className="font-display font-semibold">Batch</TableHead>
            <TableHead className="font-display font-semibold hidden sm:table-cell">
              Status
            </TableHead>
            <TableHead className="w-16 font-display font-semibold">
              Del
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <BatchVideoRows
            navigate={navigate}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            deletingId={deletingId}
          />
        </TableBody>
      </Table>
    </div>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { mutate: checkPassword, isPending } = useCheckAdminPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    checkPassword(password, {
      onSuccess: (isValid) => {
        if (isValid) {
          onUnlock();
        } else {
          setError("Incorrect password. Please try again.");
          setPassword("");
        }
      },
      onError: () => {
        setError("Could not verify password. Please try again.");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            Admin Panel
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Enter the admin password to continue.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="font-display font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  className="font-body pr-10"
                  disabled={isPending}
                  autoFocus
                  data-ocid="admin.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-ocid="admin.password.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <p
                  className="text-destructive text-xs font-body"
                  data-ocid="admin.password.error_state"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!password.trim() || isPending}
              className="w-full font-display font-semibold gap-2"
              data-ocid="admin.password.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Unlock Panel
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-4">
          Default password: <span className="font-mono">nexttopper123</span>
        </p>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showFields, setShowFields] = useState(false);
  const { mutate: checkPassword } = useCheckAdminPassword();
  const { mutate: setAdminPassword, isPending } = useSetAdminPassword();

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    checkPassword(currentPw, {
      onSuccess: (isValid) => {
        if (!isValid) {
          toast.error("Current password is incorrect.");
          return;
        }
        setAdminPassword(newPw, {
          onSuccess: () => {
            toast.success("Password changed successfully!");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
            setShowFields(false);
          },
          onError: (err) => {
            toast.error(`Failed: ${(err as Error).message}`);
          },
        });
      },
    });
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display font-bold text-2xl text-foreground">
          Security
        </h2>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Change the admin panel password.
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        {!showFields ? (
          <Button
            variant="outline"
            onClick={() => setShowFields(true)}
            className="gap-2 font-display"
            data-ocid="admin.security.open_modal_button"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleChange} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label className="font-display font-medium">
                Current Password
              </Label>
              <Input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="font-body"
                disabled={isPending}
                data-ocid="admin.security.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-medium">New Password</Label>
              <Input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password (min 4 chars)"
                className="font-body"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-display font-medium">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="font-body"
                disabled={isPending}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!currentPw || !newPw || !confirmPw || isPending}
                className="font-display font-semibold gap-2"
                data-ocid="admin.security.submit_button"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Save Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowFields(false);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmPw("");
                }}
                data-ocid="admin.security.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default function AdminPage({ navigate }: AdminPageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();

  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: addVideo } = useAddVideo();

  const detectedFileType = selectedFile
    ? selectedFile.type === "application/pdf" ||
      selectedFile.name.endsWith(".pdf")
      ? "pdf"
      : "video"
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isUploading) fileInputRef.current?.click();
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !selectedBatch || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      void ExternalBlob;

      const { loadConfig } = await import("../config");
      const { StorageClient } = await import("../utils/StorageClient");
      const { HttpAgent } = await import("@icp-sdk/core/agent");

      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });

      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const { hash } = await storageClient.putFile(fileBytes, (pct) => {
        setUploadProgress(pct);
      });

      const directUrl = await storageClient.getDirectURL(hash);
      const fileType = detectedFileType ?? "video";
      const encodedTitle = `${videoTitle.trim()}||${directUrl}||${fileType}`;

      addVideo(
        { title: encodedTitle, batchId: selectedBatch },
        {
          onSuccess: () => {
            toast.success(`"${videoTitle}" uploaded successfully!`);
            setVideoTitle("");
            setSelectedBatch("");
            setSelectedFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setIsUploading(false);
          },
          onError: (err) => {
            toast.error(`Upload failed: ${(err as Error).message}`);
            setIsUploading(false);
          },
        },
      );
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground font-body mb-6">
            You need to be logged in to access the Admin Panel.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground font-body mb-6">
            You don&apos;t have admin privileges.
          </p>
          <Button variant="outline" onClick={() => navigate({ name: "home" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Password gate — shown after login + admin check
  if (!passwordUnlocked) {
    return <PasswordGate onUnlock={() => setPasswordUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ name: "home" })}
              className="gap-2 font-display -ml-2"
              data-ocid="admin.home.link"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Admin Panel
              </h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-body text-xs hidden sm:inline-flex">
                Next Topper
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userProfile && (
              <span className="text-sm text-muted-foreground font-body hidden sm:block">
                {userProfile.name}
              </span>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Upload Section */}
          <section>
            <div className="mb-5">
              <h2 className="font-display font-bold text-2xl text-foreground">
                Upload File
              </h2>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Upload a video or PDF to any batch. It will be immediately
                available to students.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <form onSubmit={handleUpload} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-display font-medium">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Quadratic Equations — Full Lecture"
                      className="font-body"
                      disabled={isUploading}
                      data-ocid="admin.upload.input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="batch-select"
                      className="font-display font-medium"
                    >
                      Select Batch <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedBatch}
                      onValueChange={setSelectedBatch}
                      disabled={isUploading}
                    >
                      <SelectTrigger
                        id="batch-select"
                        className="font-body"
                        data-ocid="admin.batch.select"
                      >
                        <SelectValue placeholder="Choose a batch..." />
                      </SelectTrigger>
                      <SelectContent>
                        {BATCHES.map((b) => (
                          <SelectItem
                            key={b.id}
                            value={b.id}
                            className="font-body"
                          >
                            {b.emoji} {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="uploadFile"
                    className="font-display font-medium"
                  >
                    File (Video or PDF){" "}
                    <span className="text-destructive">*</span>
                  </Label>

                  {/* File type tabs */}
                  <div className="flex gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-1 rounded-md flex items-center gap-1">
                      <Film className="h-3 w-3" /> Videos: MP4, MOV, AVI, MKV
                    </span>
                    <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-1 rounded-md flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Documents: PDF
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Click to select a video or PDF file"
                    className={`
                      w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors
                      ${
                        selectedFile
                          ? detectedFileType === "pdf"
                            ? "border-orange-400/50 bg-orange-500/5"
                            : "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }
                      ${isUploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
                    `}
                    onClick={() =>
                      !isUploading && fileInputRef.current?.click()
                    }
                    onKeyDown={handleDropZoneKeyDown}
                    data-ocid="admin.upload.dropzone"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        {detectedFileType === "pdf" ? (
                          <FileText className="h-5 w-5 text-orange-500 shrink-0" />
                        ) : (
                          <Film className="h-5 w-5 text-primary shrink-0" />
                        )}
                        <div className="text-left">
                          <p className="font-body font-medium text-foreground text-sm truncate max-w-xs">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                            {detectedFileType === "pdf"
                              ? " · PDF Document"
                              : " · Video"}
                          </p>
                        </div>
                        {!isUploading && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="text-muted-foreground hover:text-destructive ml-auto"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="font-display font-medium text-foreground text-sm">
                          Click to select a video or PDF
                        </p>
                        <p className="text-xs text-muted-foreground font-body mt-1">
                          MP4, MOV, AVI, MKV, PDF supported
                        </p>
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    id="uploadFile"
                    type="file"
                    accept="video/*,.pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>

                {/* Upload progress */}
                {isUploading && (
                  <div
                    className="space-y-2"
                    data-ocid="admin.upload.loading_state"
                  >
                    <div className="flex justify-between text-xs font-body text-muted-foreground">
                      <span>
                        {detectedFileType === "pdf"
                          ? "Uploading PDF..."
                          : "Uploading video..."}
                        {uploadProgress < 30 ? " (processing chunks)" : ""}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    !videoTitle.trim() ||
                    !selectedBatch ||
                    !selectedFile ||
                    isUploading
                  }
                  className="font-display font-semibold gap-2 w-full sm:w-auto"
                  data-ocid="admin.upload.submit_button"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload{" "}
                      {detectedFileType === "pdf"
                        ? "PDF"
                        : detectedFileType === "video"
                          ? "Video"
                          : "File"}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </section>

          {/* All Files */}
          <section>
            <div className="mb-5">
              <h2 className="font-display font-bold text-2xl text-foreground">
                All Files
              </h2>
              <p className="text-muted-foreground font-body text-sm mt-1">
                Manage all uploaded videos and PDFs across every batch.
              </p>
            </div>
            <AllVideosTable navigate={navigate} />
          </section>

          {/* Change Password */}
          <ChangePasswordSection />
        </div>
      </main>

      <footer className="border-t border-border py-6 bg-card mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground font-body flex items-center justify-center gap-1">
            © 2026. Built with{" "}
            <Heart className="h-3.5 w-3.5 text-primary fill-primary inline" />{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
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
