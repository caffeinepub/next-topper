import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  Film,
  Heart,
  Loader2,
  Play,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { ExternalBlob } from "../backend";
import type { Video } from "../backend.d";
import LoginButton from "../components/LoginButton";
import { getBatchById } from "../data/batches";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteVideo,
  useGetCallerUserProfile,
  useGetVideosByBatch,
  useIsCallerAdmin,
} from "../hooks/useQueries";

interface BatchPageProps {
  batchId: string;
  batchLabel: string;
  navigate: (page: AppPage) => void;
}

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

function VideoPlayer({
  video,
  onClose,
}: { video: Video; onClose: () => void }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const { blobId, title } = parseVideoTitle(video.title);

  useEffect(() => {
    if (!blobId) {
      setError("No video file attached to this entry.");
      setLoading(false);
      return;
    }
    try {
      const blob = ExternalBlob.fromURL(blobId);
      setVideoUrl(blob.getDirectURL());
    } catch (err) {
      setError("Failed to load video.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [blobId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-3xl p-0 overflow-hidden"
        data-ocid="batch.video.modal"
      >
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="font-display font-semibold text-lg line-clamp-2 pr-6">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-black rounded-b-xl overflow-hidden">
          {loading && (
            <div
              className="aspect-video flex items-center justify-center"
              data-ocid="batch.video.loading_state"
            >
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          {error && (
            <div
              className="aspect-video flex flex-col items-center justify-center text-white/70 gap-3"
              data-ocid="batch.video.error_state"
            >
              <Film className="h-12 w-12 opacity-50" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && videoUrl && (
            <div className="relative">
              <video
                src={videoUrl}
                controls
                autoPlay
                preload="auto"
                className="w-full aspect-video"
                controlsList="nodownload"
                playsInline
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
              >
                <track kind="captions" />
              </video>
              {isBuffering && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none"
                  data-ocid="batch.video.loading_state"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                    <span className="text-white/70 text-xs font-body">
                      Buffering…
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PDFViewer({ video, onClose }: { video: Video; onClose: () => void }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { blobId, title } = parseVideoTitle(video.title);

  useEffect(() => {
    if (!blobId) {
      setError("No PDF file attached to this entry.");
      setLoading(false);
      return;
    }
    try {
      const blob = ExternalBlob.fromURL(blobId);
      setPdfUrl(blob.getDirectURL());
    } catch (err) {
      setError("Failed to load PDF.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [blobId]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
      data-ocid="batch.pdf.modal"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 text-orange-500 shrink-0" />
          <h2 className="font-display font-semibold text-foreground truncate text-base">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-body text-primary hover:underline hidden sm:block"
            >
              Open in new tab
            </a>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0"
            data-ocid="batch.pdf.close_button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-neutral-900">
        {loading && (
          <div
            className="h-full flex items-center justify-center"
            data-ocid="batch.pdf.loading_state"
          >
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        {error && (
          <div
            className="h-full flex flex-col items-center justify-center text-white/70 gap-3"
            data-ocid="batch.pdf.error_state"
          >
            <FileText className="h-12 w-12 opacity-40" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && pdfUrl && (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={title}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export default function BatchPage({
  batchId,
  batchLabel,
  navigate,
}: BatchPageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: videos, isLoading, isError } = useGetVideosByBatch(batchId);
  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideo();
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [viewingPdf, setViewingPdf] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const batch = getBatchById(batchId);

  const handleDelete = (video: Video) => {
    setDeletingId(video.id);
    const { title } = parseVideoTitle(video.title);
    deleteVideo(
      { id: video.id, batchId },
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ name: "home" })}
              className="gap-2 font-display shrink-0 -ml-2"
              data-ocid="batch.home.link"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              {batch && (
                <span
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-base ${batch.cardClass}`}
                >
                  {batch.emoji}
                </span>
              )}
              <h1 className="font-display font-bold text-lg text-foreground truncate">
                {batchLabel}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground font-body hidden sm:block">
                {userProfile.name}
              </span>
            )}
            {isAuthenticated && isAdmin && (
              <Button
                onClick={() => navigate({ name: "admin" })}
                size="sm"
                variant="outline"
                className="gap-2 font-display font-medium border-primary/30 text-primary hover:bg-primary/10"
                data-ocid="batch.admin.link"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {batch && (
            <div
              className={`rounded-2xl p-6 sm:p-8 mb-8 text-white grain ${batch.cardClass} shadow-card`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="bg-white/20 border-white/30 text-white text-xs mb-2 hover:bg-white/30">
                    {batch.id.toUpperCase()}
                  </Badge>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-shadow-sm">
                    {batch.label}
                  </h2>
                  <p className="text-white/80 font-body mt-1 text-shadow-sm">
                    {batch.description}
                  </p>
                </div>
                <span className="text-5xl shrink-0">{batch.emoji}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-white/80 text-sm font-body">
                  {isLoading
                    ? "Loading..."
                    : `${videos?.length ?? 0} item${videos?.length !== 1 ? "s" : ""} available`}
                </span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {(["s1", "s2", "s3", "s4"] as const).map((k) => (
                <div
                  key={k}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-20 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div
              className="text-center py-16"
              data-ocid="batch.videos.error_state"
            >
              <p className="text-destructive font-body">
                Failed to load content. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && videos?.length === 0 && (
            <div
              className="text-center py-20"
              data-ocid="batch.videos.empty_state"
            >
              <Film className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                No Content Yet
              </h3>
              <p className="text-muted-foreground font-body">
                {isAdmin
                  ? "Upload videos or PDFs for this batch from the Admin Panel."
                  : "Content for this batch is coming soon. Check back later!"}
              </p>
              {isAdmin && (
                <Button
                  onClick={() => navigate({ name: "admin" })}
                  className="mt-4 font-display font-semibold gap-2"
                  data-ocid="batch.admin.primary_button"
                >
                  <Shield className="h-4 w-4" /> Go to Admin Panel
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && videos && videos.length > 0 && (
            <div className="space-y-3">
              {videos.map((video, index) => {
                const { title, blobId, fileType } = parseVideoTitle(
                  video.title,
                );
                const isCurrentlyDeleting =
                  isDeleting && deletingId === video.id;
                const isPdf = fileType === "pdf";
                return (
                  <div
                    key={video.id.toString()}
                    className="animate-fade-up group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-200"
                    style={{ animationDelay: `${index * 0.06}s` }}
                    data-ocid={`batch.item.${index + 1}`}
                  >
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? "bg-orange-500/15 border border-orange-500/20" : (batch?.cardClass ?? "bg-primary")}`}
                    >
                      {isPdf ? (
                        <FileText className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Play className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-foreground truncate">
                        {title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {blobId
                          ? isPdf
                            ? "PDF Document"
                            : "Video ready"
                          : "No file attached"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          isPdf ? setViewingPdf(video) : setPlayingVideo(video)
                        }
                        className={`gap-2 font-display font-medium ${isPdf ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : ""}`}
                        disabled={!blobId}
                        data-ocid={`batch.item.${index + 1}.primary_button`}
                      >
                        {isPdf ? (
                          <>
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Open PDF</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">Play</span>
                          </>
                        )}
                      </Button>
                      {isAdmin && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(video)}
                          disabled={isCurrentlyDeleting}
                          className="gap-1.5 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                          data-ocid={`batch.item.${index + 1}.delete_button`}
                        >
                          {isCurrentlyDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
      {viewingPdf && (
        <PDFViewer video={viewingPdf} onClose={() => setViewingPdf(null)} />
      )}

      <footer className="border-t border-border py-6 bg-card mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
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
