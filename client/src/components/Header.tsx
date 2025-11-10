import { Link, useLocation } from "wouter";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 cursor-pointer px-2 py-1 rounded-md">
              <div className="relative">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">LekkerSpots</span>
                <span className="text-xs text-muted-foreground leading-tight">Western Cape Hidden Gems</span>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" data-testid="link-nav-home">
              <span className={`text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer ${isActive("/") ? "text-foreground" : "text-muted-foreground"}`}>
                Home
              </span>
            </Link>
            <Link href="/categories" data-testid="link-nav-categories">
              <span className={`text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer ${isActive("/categories") ? "text-foreground" : "text-muted-foreground"}`}>
                Categories
              </span>
            </Link>
            <Link href="/map" data-testid="link-nav-map">
              <span className={`text-sm font-medium hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer ${isActive("/map") ? "text-foreground" : "text-muted-foreground"}`}>
                Map View
              </span>
            </Link>
            <Link href="/admin/login" data-testid="link-nav-admin">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      <div className="h-[2px]" style={{ background: 'linear-gradient(to right, hsl(var(--accent)), hsl(var(--orange)), hsl(var(--secondary)), hsl(var(--primary)))' }} />

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col gap-1 px-4 py-4">
            <Link href="/" data-testid="link-mobile-home">
              <span className={`block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer ${isActive("/") ? "text-foreground" : "text-muted-foreground"}`}>
                Home
              </span>
            </Link>
            <Link href="/categories" data-testid="link-mobile-categories">
              <span className={`block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer ${isActive("/categories") ? "text-foreground" : "text-muted-foreground"}`}>
                Categories
              </span>
            </Link>
            <Link href="/map" data-testid="link-mobile-map">
              <span className={`block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer ${isActive("/map") ? "text-foreground" : "text-muted-foreground"}`}>
                Map View
              </span>
            </Link>
            <Link href="/admin/login" data-testid="link-mobile-admin">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Admin Login
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
