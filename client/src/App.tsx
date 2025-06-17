import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dictionary from "@/pages/Dictionary";
import MedicalDictionaryModule from "@/pages/MedicalDictionaryModule";
import LegalDictionaryModule from "@/pages/LegalDictionaryModule";
import TetumMonolingualModule from "@/pages/TetumMonolingualModule";
import INLTetumDictionaryModule from "@/pages/INLTetumDictionaryModule";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dictionary} />
      <Route path="/medical-dictionary" component={MedicalDictionaryModule} />
      <Route path="/legal-dictionary" component={LegalDictionaryModule} />
      <Route path="/tetum-monolingual" component={TetumMonolingualModule} />
      <Route path="/inl-tetum-dictionary" component={INLTetumDictionaryModule} />
      <Route component={NotFound} />
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
