import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import DirectoryPage from "@/pages/directory-new";
import JoinPage from "@/pages/join";
import CorePage from "@/pages/core-new";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import ProfilePage from "@/pages/profile";
import AccountSettingsPage from "@/pages/account-settings";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import UpgradeModal from "@/components/upgrade-modal";
import { UpgradeModalProvider, useUpgradeModal } from "@/hooks/use-upgrade-modal";
import type { User } from "@shared/schema";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function GlobalUpgradeModal() {
  const { open, closeUpgradeModal } = useUpgradeModal();
  const loggedInUserId = localStorage.getItem("currentUserId");
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const currentUser = users.find((u) => u.id.toString() === loggedInUserId);

  return (
    <UpgradeModal
      open={open}
      onClose={closeUpgradeModal}
      currentPlan={currentUser?.memberLevel ?? "Free"}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route>
        <ScrollToTop />
        <div className="min-h-screen bg-black">
          <Navigation />
          <Switch>
            <Route path="/home" component={ProfilePage} />
            <Route path="/profile/:userSlug" component={ProfilePage} />
            <Route path="/account-settings" component={AccountSettingsPage} />
            <Route path="/directory" component={DirectoryPage} />
            <Route path="/join" component={JoinPage} />
            <Route path="/core" component={CorePage} />
            <Route path="/admin" component={AdminPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UpgradeModalProvider>
          <Toaster />
          <Router />
          <GlobalUpgradeModal />
        </UpgradeModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
