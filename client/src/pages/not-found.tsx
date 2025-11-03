import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LottieAnimation from "@/components/LottieAnimation";
import emptyStateAnimation from "@assets/animations/empty-state.json";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <LottieAnimation
            animationData={emptyStateAnimation}
            loop={true}
            autoplay={true}
            className="w-48 h-48 mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
