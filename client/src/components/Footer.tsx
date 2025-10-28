import { MapPin, Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">Cape Town</span>
                <span className="text-xs text-muted-foreground leading-tight">Golden Nuggets</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover the hidden gems of Cape Town, curated by locals who know the city best.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" data-testid="link-footer-home">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Home</span>
              </Link>
              <Link href="/categories" data-testid="link-footer-categories">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Categories</span>
              </Link>
              <Link href="/map" data-testid="link-footer-map">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Map View</span>
              </Link>
              <Link href="/admin" data-testid="link-footer-admin">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Admin</span>
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground" data-testid="link-email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get updates on new locations
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="text-sm"
                data-testid="input-newsletter"
              />
              <Button size="sm" data-testid="button-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cape Town Golden Nuggets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
