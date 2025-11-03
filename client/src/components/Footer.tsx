import { MapPin, Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSubscriptionSchema, type NewsletterSubscription } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LottieAnimation from "@/components/LottieAnimation";
import confettiAnimation from "@assets/animations/confetti.json";
import { useState } from "react";

export default function Footer() {
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const form = useForm<NewsletterSubscription>({
    resolver: zodResolver(newsletterSubscriptionSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: NewsletterSubscription) => {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return await res.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter. Check your email for confirmation.",
      });
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to subscribe. Please try again later.";
      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterSubscription) => {
    subscribeMutation.mutate(data);
  };

  return (
    <footer className="relative border-t bg-card">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <LottieAnimation
            animationData={confettiAnimation}
            loop={false}
            autoplay={true}
            className="w-full h-full max-w-2xl"
            onComplete={() => setShowConfetti(false)}
          />
        </div>
      )}
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Your name"
                          className="text-sm"
                          data-testid="input-newsletter-name"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Your email"
                          className="text-sm"
                          data-testid="input-newsletter-email"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={subscribeMutation.isPending}
                  data-testid="button-subscribe"
                >
                  {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Cape Town Golden Nuggets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
