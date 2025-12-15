import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import MapPage from "@/pages/MapPage";
import LocationDetail from "@/pages/LocationDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCategories from "@/pages/AdminCategories";
import AdminAddLocation from "@/pages/AdminAddLocation";
import AdminEditLocation from "@/pages/AdminEditLocation";
import AdminTicker from "@/pages/AdminTicker";
import AboutUs from "@/pages/AboutUs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/map" component={MapPage} />
      <Route path="/about" component={AboutUs} />
      <Route path="/location/:slug" component={LocationDetail} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/ticker" component={AdminTicker} />
      <Route path="/admin/add" component={AdminAddLocation} />
      <Route path="/admin/edit/:id" component={AdminEditLocation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
