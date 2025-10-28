import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type { Category } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminCategories() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to manage categories.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/categories", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setShowDialog(false);
      setFormData({ name: "", description: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCategory) return;
      await apiRequest("PUT", `/api/categories/${editingCategory.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setShowDialog(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (authLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-admin-categories" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="heading-admin-categories">
                Manage Categories
              </h1>
              <p className="text-muted-foreground">
                Add, edit, or delete location categories
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setLocation("/admin")} data-testid="button-back-to-dashboard">
                Back to Dashboard
              </Button>
              <Button onClick={handleOpenCreateDialog} data-testid="button-add-category">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>

          {!categories || categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No categories yet</p>
                <Button onClick={handleOpenCreateDialog} data-testid="button-add-first-category">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover-elevate" data-testid={`card-category-${category.id}`}>
                  <CardHeader>
                    <CardTitle className="text-xl" data-testid={`text-category-name-${category.id}`}>
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <CardDescription data-testid={`text-category-description-${category.id}`}>
                        {category.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditDialog(category)}
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="dialog-category-form">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle data-testid="dialog-title">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? "Update the category details below" 
                  : "Create a new category for organizing locations"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Coffee Shop"
                  data-testid="input-category-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this category"
                  data-testid="input-category-description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                data-testid="button-cancel-category"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-category"
              >
                {(createMutation.isPending || updateMutation.isPending) 
                  ? "Saving..." 
                  : editingCategory 
                    ? "Update Category" 
                    : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
