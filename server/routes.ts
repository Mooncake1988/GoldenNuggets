import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertLocationSchema, insertCategorySchema, newsletterSubscriptionSchema, insertTickerItemSchema, insertInsiderTipSchema } from "@shared/schema";
import passport from "passport";
import { notifyLocationCreated, notifyLocationUpdated, notifyLocationDeleted } from "./indexnow";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, (req: Request, res) => {
    res.json({ user: req.user });
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ method: "PUT", url: uploadURL });
  });

  app.post("/api/locations/image", isAuthenticated, async (req: Request, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin",
          visibility: "public",
        },
      );
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting location image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(parsed);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getCategory(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Category not found" });
      }
      const parsed = insertCategorySchema.partial().parse(req.body);
      
      // Check if the new name already exists (if renaming)
      if (parsed.name && parsed.name !== existing.name) {
        const allCategories = await storage.getAllCategories();
        const duplicateName = allCategories.find(
          cat => cat.id !== req.params.id && cat.name === parsed.name
        );
        if (duplicateName) {
          return res.status(400).json({ error: "A category with this name already exists" });
        }
      }
      
      // Update the category
      const category = await storage.updateCategory(req.params.id, parsed);
      
      // If the category name changed, update all locations with the old category name
      if (parsed.name && parsed.name !== existing.name) {
        const allLocations = await storage.getAllLocations();
        const locationsToUpdate = allLocations.filter(loc => loc.category === existing.name);
        
        for (const location of locationsToUpdate) {
          await storage.updateLocation(location.id, { category: parsed.name });
        }
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getCategory(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Category not found" });
      }
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Search query parameter 'q' is required" });
      }
      const tag = req.query.tag && typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const locations = await storage.searchLocations(query, tag);
      res.json(locations);
    } catch (error) {
      console.error("Error searching locations:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  app.get("/api/tags", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const tags = await storage.getPopularTags(limit);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  app.get("/api/locations/by-tag/:tag", async (req, res) => {
    try {
      const tag = decodeURIComponent(req.params.tag);
      const locations = await storage.getLocationsByTag(tag);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations by tag:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const locations = await storage.getFeaturedLocations(limit, offset);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching featured locations:", error);
      res.status(500).json({ error: "Failed to fetch featured locations" });
    }
  });

  app.get("/api/locations/by-slug/:slug", async (req, res) => {
    try {
      const slug = decodeURIComponent(req.params.slug);
      const location = await storage.getLocationBySlug(slug);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching location by slug:", error);
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  app.get("/api/locations/:id/related", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      if (!location.relatedLocationIds || location.relatedLocationIds.length === 0) {
        return res.json([]);
      }
      const relatedLocations = await storage.getLocationsByIds(location.relatedLocationIds);
      res.json(relatedLocations);
    } catch (error) {
      console.error("Error fetching related locations:", error);
      res.status(500).json({ error: "Failed to fetch related locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(parsed);
      
      // Notify IndexNow about the new location (fire and forget, but log errors)
      notifyLocationCreated(location.slug).catch((err) => {
        console.error("[IndexNow] Failed to notify location creation:", err);
      });
      
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.put("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(req.params.id, parsed);
      
      // Notify IndexNow about the updated location (fire and forget, but log errors)
      if (location) {
        notifyLocationUpdated(location.slug).catch((err) => {
          console.error("[IndexNow] Failed to notify location update:", err);
        });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      // Get the location before deleting to access the slug for IndexNow
      const location = await storage.getLocation(req.params.id);
      const slug = location?.slug;
      
      await storage.deleteLocation(req.params.id);
      
      // Notify IndexNow about the deleted location (fire and forget, but log errors)
      if (slug) {
        notifyLocationDeleted(slug).catch((err) => {
          console.error("[IndexNow] Failed to notify location deletion:", err);
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  // Ticker Items Routes
  app.get("/api/ticker", async (req, res) => {
    try {
      const items = await storage.getActiveTickerItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching active ticker items:", error);
      res.status(500).json({ error: "Failed to fetch ticker items" });
    }
  });

  app.get("/api/admin/ticker", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllTickerItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching all ticker items:", error);
      res.status(500).json({ error: "Failed to fetch ticker items" });
    }
  });

  app.get("/api/admin/ticker/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getTickerItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Ticker item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching ticker item:", error);
      res.status(500).json({ error: "Failed to fetch ticker item" });
    }
  });

  app.post("/api/admin/ticker", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertTickerItemSchema.parse(req.body);
      const item = await storage.createTickerItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating ticker item:", error);
      res.status(400).json({ error: "Invalid ticker item data" });
    }
  });

  app.put("/api/admin/ticker/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getTickerItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Ticker item not found" });
      }
      const parsed = insertTickerItemSchema.partial().parse(req.body);
      const item = await storage.updateTickerItem(req.params.id, parsed);
      res.json(item);
    } catch (error) {
      console.error("Error updating ticker item:", error);
      res.status(400).json({ error: "Invalid ticker item data" });
    }
  });

  app.delete("/api/admin/ticker/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getTickerItem(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Ticker item not found" });
      }
      await storage.deleteTickerItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ticker item:", error);
      res.status(500).json({ error: "Failed to delete ticker item" });
    }
  });

  // Insider Tips Routes
  app.get("/api/locations/:locationId/insider-tips", async (req, res) => {
    try {
      const tips = await storage.getInsiderTipsByLocationId(req.params.locationId);
      res.json(tips);
    } catch (error) {
      console.error("Error fetching insider tips:", error);
      res.status(500).json({ error: "Failed to fetch insider tips" });
    }
  });

  app.get("/api/admin/insider-tips/:id", isAuthenticated, async (req, res) => {
    try {
      const tip = await storage.getInsiderTip(req.params.id);
      if (!tip) {
        return res.status(404).json({ error: "Insider tip not found" });
      }
      res.json(tip);
    } catch (error) {
      console.error("Error fetching insider tip:", error);
      res.status(500).json({ error: "Failed to fetch insider tip" });
    }
  });

  app.post("/api/admin/insider-tips", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertInsiderTipSchema.parse(req.body);
      const tip = await storage.createInsiderTip(parsed);
      res.status(201).json(tip);
    } catch (error) {
      console.error("Error creating insider tip:", error);
      res.status(400).json({ error: "Invalid insider tip data" });
    }
  });

  app.put("/api/admin/insider-tips/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getInsiderTip(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Insider tip not found" });
      }
      const parsed = insertInsiderTipSchema.partial().parse(req.body);
      const tip = await storage.updateInsiderTip(req.params.id, parsed);
      res.json(tip);
    } catch (error) {
      console.error("Error updating insider tip:", error);
      res.status(400).json({ error: "Invalid insider tip data" });
    }
  });

  app.delete("/api/admin/insider-tips/:id", isAuthenticated, async (req, res) => {
    try {
      const existing = await storage.getInsiderTip(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Insider tip not found" });
      }
      await storage.deleteInsiderTip(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting insider tip:", error);
      res.status(500).json({ error: "Failed to delete insider tip" });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const parsed = newsletterSubscriptionSchema.parse(req.body);
      
      const beehiivApiKey = process.env.BEEHIIV_API_KEY;
      const beehiivPublicationId = process.env.BEEHIIV_PUBLICATION_ID;

      if (!beehiivApiKey || !beehiivPublicationId) {
        console.error("Missing Beehiiv credentials");
        return res.status(500).json({ error: "Newsletter service is not configured" });
      }

      const beehiivPayload: any = {
        email: parsed.email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: "website",
        utm_medium: "organic",
        referring_site: "website",
      };

      if (parsed.name) {
        beehiivPayload.custom_fields = [
          {
            name: "Name",
            value: parsed.name,
          },
        ];
      }

      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${beehiivPublicationId}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${beehiivApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(beehiivPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Beehiiv API error:", response.status, errorData);
        
        if (response.status === 400 && errorData.message?.includes("already exists")) {
          return res.status(400).json({ error: "This email is already subscribed to our newsletter" });
        }
        
        return res.status(500).json({ error: "Failed to subscribe. Please try again later." });
      }

      const data = await response.json();
      res.status(200).json({ message: "Successfully subscribed to newsletter!", data });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid subscription data" });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ error: "Failed to subscribe. Please try again later." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
