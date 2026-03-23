import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import DirectoryPage from "@/pages/directory-new";
import JoinPage from "@/pages/join";
import CorePage from "@/pages/core-new";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import AccountSettingsPage from "@/pages/account-settings";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
