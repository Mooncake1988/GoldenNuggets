import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation as useWouterLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObjectUploader } from "@/components/ObjectUploader";
import InsiderTipsManager from "@/components/InsiderTipsManager";
import { Upload, X, Loader2, MapPin, Plus, Compass, Instagram } from "lucide-react";
import type { UploadResult } from "@uppy/core";
import type { Location, Category } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminEditLocation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useWouterLocation();
  const params = useParams();
  const locationId = params.id;
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    neighborhood: "",
    description: "",
    address: "",
    latitude: "-33.9249",
    longitude: "18.4241",
    tags: "",
    featured: false,
    instagramHashtag: "",
  });
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([]);

  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const currentLocation = locations?.find(loc => loc.id === locationId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to edit locations.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });
  };

  useEffect(() => {
    if (currentLocation) {
      setFormData({
        name: currentLocation.name,
        slug: currentLocation.slug,
        category: currentLocation.category,
        neighborhood: currentLocation.neighborhood,
        description: currentLocation.description,
        address: currentLocation.address || "",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        tags: currentLocation.tags.join(", "),
        featured: currentLocation.featured,
        instagramHashtag: currentLocation.instagramHashtag || "",
      });
      setUploadedImages(currentLocation.images);
      setSelectedRelatedIds(currentLocation.relatedLocationIds || []);
    }
  }, [currentLocation]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
      await apiRequest("PUT", `/api/locations/${locationId}`, {
        ...formData,
        tags: tagsArray,
        images: uploadedImages,
        relatedLocationIds: selectedRelatedIds,
        instagramHashtag: formData.instagramHashtag || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedUrls = result.successful.map(file => file.uploadURL);
      
      for (const url of uploadedUrls) {
        try {
          const response = await fetch("/api/locations/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageURL: url }),
          });
          const data = await response.json();
          setUploadedImages(prev => [...prev, data.objectPath]);
        } catch (error) {
          console.error("Error processing uploaded image:", error);
        }
      }
      
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setUploadedImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (authLoading || locationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !currentLocation) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Location</CardTitle>
              <CardDescription>Update the details for {currentLocation.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    data-testid="input-slug"
                    placeholder="url-friendly-name"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used in the URL: /location/{formData.slug || 'your-slug-here'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      data-testid="select-category"
                    >
                      <option value="">Select a category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood *</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      required
                      data-testid="input-neighborhood"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                      data-testid="input-latitude"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                      data-testid="input-longitude"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Specialty Coffee, Brunch, Instagram Worthy"
                    data-testid="input-tags"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
                    data-testid="checkbox-featured"
                  />
                  <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                    Featured Location
                  </Label>
                  <p className="text-xs text-muted-foreground ml-2">
                    (Featured locations appear on the homepage)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramHashtag" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    Instagram Hashtag
                  </Label>
                  <Input
                    id="instagramHashtag"
                    value={formData.instagramHashtag}
                    onChange={(e) => setFormData({ ...formData, instagramHashtag: e.target.value.replace(/^#/, '') })}
                    placeholder="e.g. papkuilsfontein"
                    data-testid="input-instagram-hashtag"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the Instagram hashtag (without #) to track social trends for this location. This enables the "Trending" feature.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Continue Your Adventure (Related Spots)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Link 2-3 nearby spots visitors might explore next. This improves SEO and keeps visitors engaged.
                    </p>
                  </div>

                  {selectedRelatedIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedRelatedIds.map((relatedId) => {
                        const relatedLoc = locations?.find(loc => loc.id === relatedId);
                        if (!relatedLoc) return null;
                        return (
                          <Badge 
                            key={relatedId} 
                            variant="secondary" 
                            className="flex items-center gap-1 pr-1"
                            data-testid={`badge-related-${relatedId}`}
                          >
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{relatedLoc.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedRelatedIds(prev => prev.filter(id => id !== relatedId))}
                              className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                              data-testid={`button-remove-related-${relatedId}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !selectedRelatedIds.includes(e.target.value)) {
                        setSelectedRelatedIds(prev => [...prev, e.target.value]);
                      }
                    }}
                    data-testid="select-related-location"
                  >
                    <option value="">Add a related spot...</option>
                    {locations
                      ?.filter(loc => loc.id !== locationId && !selectedRelatedIds.includes(loc.id))
                      .map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.neighborhood})
                        </option>
                      ))}
                  </select>
                  
                  {selectedRelatedIds.length >= 3 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Tip: 2-3 related spots is optimal. More can overwhelm visitors.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <ObjectUploader
                    maxNumberOfFiles={10}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload Images</span>
                    </div>
                  </ObjectUploader>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Drag images to reorder. The first image will be the preview thumbnail.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((imagePath, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`relative aspect-square rounded-lg border-2 transition-all cursor-move ${
                              draggedIndex === index 
                                ? 'opacity-50 border-primary scale-95' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            data-testid={`image-item-${index}`}
                          >
                            <img
                              src={imagePath}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md shadow-lg">
                                Preview Image
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover-elevate active-elevate-2 shadow-lg transition-transform hover:scale-110"
                              data-testid={`button-remove-image-${index}`}
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Location"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <InsiderTipsManager locationId={locationId!} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
