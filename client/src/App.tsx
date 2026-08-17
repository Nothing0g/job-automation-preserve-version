import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import JobsDashboard from "./pages/JobsDashboard";
import JobWorkspace from "./pages/JobWorkspace";
import MasterProfilePage from "./pages/MasterProfilePage";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";

function Router() {
  return <Switch><Route path="/"><DashboardLayout><JobsDashboard /></DashboardLayout></Route><Route path="/profile"><DashboardLayout><MasterProfilePage /></DashboardLayout></Route><Route path="/jobs/:id"><DashboardLayout><JobWorkspace /></DashboardLayout></Route><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
