import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const CANONICAL_BASE_URL = "https://lekkerspots.co.za";

export default function AboutUs() {
  const pageTitle = "About Us - The Story Behind LekkerSpots | LekkerSpots";
  const pageDescription = "Discover the story behind LekkerSpots - a personal travel diary made public, sharing hidden gems and authentic places across the Western Cape.";
  const pageUrl = `${CANONICAL_BASE_URL}/about`;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold mb-8" data-testid="text-about-title">
              The Story Behind LekkerSpots
            </h1>

            <div className="space-y-6 text-base leading-relaxed">
              <p>
                It started with a VW Polo and a messy notes problem. LekkerSpots was born out of a simple love for exploration. For the last few years, I've spent at least one weekend a month exploring the Western Cape in my VW Polo. Sometimes the goal is to find a brand new location; other times, it's just to visit a regular cottage to recharge, escape the city noise, and get a digital detox.
              </p>

              <p>
                I've always been curious. When I drive on the N7 and spot a dirt road, I find myself making a note, checking Google Maps to see where it leads, and looking for accommodation nearby.
              </p>

              <p>
                The problem was that my "system" was a mess. I had saved pins in Google Maps, bookmarks on Booking.com and Airbnb, random notes in Google Docs and Evernote, and literal Post-it notes. The information was scattered across various mediums, and I'd constantly forget where I saved a point of interest.
              </p>

              <p>
                So I decided it was time for a single source of truth.
              </p>

              <p>
                In essence, LekkerSpots is my personal travel diary, made public. It is the home for all the "lekker spots" I've found and want to share, consolidating my earlier passion projects, <em>ilovecederberg.co.za</em> and <em>bathtubswithaview.co.za</em>.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">
                What You'll Find Here
              </h2>

              <p>
                I believe travel is about discovery. This is where I share my personal list of hidden gems—the authentic places and unique experiences I've found off the beaten path, far from the recycled tourist traps.
              </p>

              <p>
                Whether you are a fellow curious mind who wonders "where does that dirt road go?", or an on-the-go adventurer looking for a quick guide, this is for you. From that perfect, cozy artisan coffee shop and breathtaking hikes to vibrant local markets and the ideal spot for a recharge.
              </p>

              <p className="font-medium">
                This is a collection of stories and spots worth sharing, powered by genuine, first-hand experience.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
