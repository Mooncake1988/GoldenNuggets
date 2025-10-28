import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertLocationSchema, insertCategorySchema } from "@shared/schema";
import passport from "passport";

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
      const locations = await storage.searchLocations(query);
      res.json(locations);
    } catch (error) {
      console.error("Error searching locations:", error);
      res.status(500).json({ error: "Failed to search locations" });
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
      res.json(location);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLocation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
