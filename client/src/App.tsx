import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import Dictionary from "@/pages/Dictionary";
import LegalGlossary from "@/pages/LegalGlossary";
import PortugueseDictionary from "@/pages/PortugueseDictionary";
import TetumDictionary from "@/pages/TetumDictionary";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/legal-glossary" component={LegalGlossary} />
      <Route path="/portuguese-dictionary" component={PortugueseDictionary} />
      <Route path="/tetum-dictionary" component={TetumDictionary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
