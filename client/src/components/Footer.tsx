import { Instagram, Mail } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterSubscriptionSchema,
  type NewsletterSubscription,
} from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LottieAnimation from "@/components/LottieAnimation";
import confettiAnimation from "@assets/animations/confetti.json";
import { useState } from "react";
import logoImage from "@assets/LekkerSpots logo_1762766705530.png";

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
        description:
          "You've been subscribed to our newsletter. Check your email for confirmation.",
      });
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "Failed to subscribe. Please try again later.";
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
    <footer className="relative bg-slate-900 text-slate-100">
      <div
        className="h-[3px]"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--orange)), hsl(var(--accent)))",
        }}
      />
      {showConfetti && (
        <div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-transparent"
          data-testid="confetti-overlay"
        >
          <div className="w-full h-full max-w-screen-xl">
            <LottieAnimation
              animationData={confettiAnimation}
              loop={false}
              autoplay={true}
              className="w-full h-full"
              onComplete={() => setShowConfetti(false)}
            />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="LekkerSpots" className="h-20 w-20" />
              <span className="font-bold text-lg leading-tight text-white">
                LekkerSpots
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Discover hidden gems and lekker spots across the Western Cape,
              curated by locals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" data-testid="link-footer-home">
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Home
                </span>
              </Link>
              <Link href="/categories" data-testid="link-footer-categories">
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Categories
                </span>
              </Link>
              <Link href="/map" data-testid="link-footer-map">
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Map View
                </span>
              </Link>
              <Link href="/about" data-testid="link-footer-about">
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  About Us
                </span>
              </Link>
              <a 
                href="https://newsletter.lekkerspots.co.za/" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-footer-stories"
              >
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Stories
                </span>
              </a>
              <Link href="/admin" data-testid="link-footer-admin">
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Admin
                </span>
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/lekkerspots/"
                className="text-pink-500 hover:text-pink-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://forms.gle/GY4WUo9EPkBvv2Ja6"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-email"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-3">
              Get updates on new locations
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
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
                          className="text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
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
                          className="text-sm bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
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

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} LekkerSpots. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
