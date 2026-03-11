import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import BatchPage from "./pages/BatchPage";
import HomePage from "./pages/HomePage";

export type AppPage =
  | { name: "home" }
  | { name: "batch"; batchId: string; batchLabel: string }
  | { name: "admin" };

export default function App() {
  const [page, setPage] = useState<AppPage>({ name: "home" });
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navigate = (p: AppPage) => setPage(p);

  return (
    <>
      <Toaster position="top-right" richColors />
      {showProfileSetup && <ProfileSetupModal />}
      {page.name === "home" && <HomePage navigate={navigate} />}
      {page.name === "batch" && (
        <BatchPage
          batchId={page.batchId}
          batchLabel={page.batchLabel}
          navigate={navigate}
        />
      )}
      {page.name === "admin" && <AdminPage navigate={navigate} />}
    </>
  );
}
