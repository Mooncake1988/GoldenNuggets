import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsiderTip } from "@shared/schema";
import { insiderTipIcons } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ObjectUploader } from "@/components/ObjectUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, X, GripVertical } from "lucide-react";
import type { UploadResult } from "@uppy/core";
import {
  Wifi,
  Dog,
  Camera,
  Clock,
  Utensils,
  Car,
  Wallet,
  Users,
  Sun,
  MapPin,
  Info,
  Star,
  Image,
} from "lucide-react";

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  dog: Dog,
  camera: Camera,
  clock: Clock,
  utensils: Utensils,
  car: Car,
  wallet: Wallet,
  users: Users,
  sun: Sun,
  "map-pin": MapPin,
  info: Info,
  star: Star,
  image: Image,
};

interface InsiderTipsManagerProps {
  locationId: string;
}

export default function InsiderTipsManager({ locationId }: InsiderTipsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<InsiderTip | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    icon: "info",
    sortOrder: "0",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { data: tips, isLoading } = useQuery<InsiderTip[]>({
    queryKey: [`/api/locations/${locationId}/insider-tips`],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { images: string[] }) => {
      await apiRequest("POST", "/api/admin/insider-tips", {
        ...data,
        locationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/insider-tips`] });
      toast({ title: "Success", description: "Insider tip added successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add insider tip", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData & { images: string[] } }) => {
      await apiRequest("PUT", `/api/admin/insider-tips/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/insider-tips`] });
      toast({ title: "Success", description: "Insider tip updated successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update insider tip", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/insider-tips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/locations/${locationId}/insider-tips`] });
      toast({ title: "Success", description: "Insider tip deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete insider tip", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ question: "", answer: "", icon: "info", sortOrder: "0" });
    setUploadedImages([]);
    setEditingTip(null);
  };

  const handleEdit = (tip: InsiderTip) => {
    setEditingTip(tip);
    setFormData({
      question: tip.question,
      answer: tip.answer,
      icon: tip.icon || "info",
      sortOrder: tip.sortOrder,
    });
    setUploadedImages(tip.images || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, images: uploadedImages };
    if (editingTip) {
      updateMutation.mutate({ id: editingTip.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
    });
    return await response.json();
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      for (const file of result.successful) {
        try {
          const response = await fetch("/api/locations/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageURL: file.uploadURL }),
          });
          const data = await response.json();
          setUploadedImages(prev => [...prev, data.objectPath]);
        } catch (error) {
          console.error("Error processing uploaded image:", error);
        }
      }
      toast({ title: "Success", description: "Image(s) uploaded successfully" });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Insider Tips</CardTitle>
          <CardDescription>
            Quick-fire FAQs that help visitors plan their trip
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-tip">
              <Plus className="h-4 w-4 mr-1" />
              Add Tip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTip ? "Edit Insider Tip" : "Add Insider Tip"}</DialogTitle>
              <DialogDescription>
                Add helpful information visitors should know before visiting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., Is there WiFi?"
                  required
                  data-testid="input-tip-question"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Write your answer here..."
                  rows={3}
                  required
                  data-testid="input-tip-answer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger data-testid="select-tip-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {insiderTipIcons.map((icon) => {
                        const IconComp = iconComponents[icon.value] || Info;
                        return (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center gap-2">
                              <IconComp className="h-4 w-4" />
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    data-testid="input-tip-sort-order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Add photos like menu shots or location details
                </p>
                <ObjectUploader
                  maxNumberOfFiles={4}
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
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                          data-testid={`button-remove-tip-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-tip"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : (editingTip ? "Update" : "Add Tip")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  data-testid="button-cancel-tip"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading tips...</p>
        ) : !tips || tips.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No insider tips yet. Add helpful information like WiFi availability, parking, or best times to visit.
          </p>
        ) : (
          <div className="space-y-2">
            {tips.map((tip) => {
              const IconComp = iconComponents[tip.icon || "info"] || Info;
              return (
                <div
                  key={tip.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                  data-testid={`tip-item-${tip.id}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <IconComp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{tip.question}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tip.answer}</p>
                    {tip.images && tip.images.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tip.images.length} image(s) attached
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(tip)}
                      data-testid={`button-edit-tip-${tip.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this tip?")) {
                          deleteMutation.mutate(tip.id);
                        }
                      }}
                      data-testid={`button-delete-tip-${tip.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
