import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Story {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  thumbnail: string | null;
  url: string;
  publishedAt: number;
  readTime: number | null;
}

function StoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function StoryCard({ story }: { story: Story }) {
  const publishDate = story.publishedAt 
    ? format(new Date(story.publishedAt * 1000), "MMM d, yyyy")
    : null;

  return (
    <a 
      href={story.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block"
      data-testid={`link-story-${story.id}`}
    >
      <Card className="h-full" data-testid={`card-story-${story.id}`}>
        <div className="aspect-[16/9] relative overflow-hidden bg-muted rounded-t-md">
          {story.thumbnail ? (
            <img 
              src={story.thumbnail} 
              alt={story.title}
              className="w-full h-full object-cover"
              loading="lazy"
              data-testid={`img-story-${story.id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {publishDate && (
              <span className="flex items-center gap-1" data-testid={`text-story-date-${story.id}`}>
                <Calendar className="h-3 w-3" />
                {publishDate}
              </span>
            )}
            {story.readTime && (
              <span data-testid={`text-story-readtime-${story.id}`}>{story.readTime} min read</span>
            )}
          </div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2" data-testid={`text-story-title-${story.id}`}>
            {story.title}
          </h3>
          {story.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-story-excerpt-${story.id}`}>
              {story.excerpt}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

export default function StoriesSection() {
  const { data: stories, isLoading, error } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  if (error) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-12 md:py-16" data-testid="section-stories">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-medium text-secondary uppercase tracking-wider" data-testid="text-stories-label">
              Stories
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1" data-testid="text-stories-title">
              From the LekkerSpots Journal
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl" data-testid="text-stories-subtitle">
              Insider tips, hidden gems, and stories from our community of local explorers
            </p>
          </div>
          <a 
            href="https://newsletter.lekkerspots.co.za/" 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid="link-view-all-stories"
          >
            <Button variant="outline" className="gap-2" data-testid="button-view-all-stories">
              View All Stories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <StoryCardSkeleton />
              <StoryCardSkeleton />
              <StoryCardSkeleton />
            </>
          ) : stories && stories.length > 0 ? (
            stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No stories available yet. Check back soon!
              </p>
              <a 
                href="https://newsletter.lekkerspots.co.za/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4"
              >
                <Button variant="outline" data-testid="button-visit-newsletter">
                  Visit Our Newsletter
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
