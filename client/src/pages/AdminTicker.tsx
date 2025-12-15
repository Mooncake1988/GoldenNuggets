import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowLeft, Edit, Trash2, ExternalLink, Megaphone } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TickerItem } from "@shared/schema";
import { tickerCategories } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import NewsTicker from "@/components/NewsTicker";

export default function AdminTicker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "updates",
    linkUrl: "",
    priority: "50",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tickerItems, isLoading: itemsLoading } = useQuery<TickerItem[]>({
    queryKey: ["/api/admin/ticker"],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        linkUrl: data.linkUrl || null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      };
      return await apiRequest("POST", "/api/admin/ticker", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ticker"] });
      toast({ title: "Success", description: "Ticker item created successfully" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Session expired.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/admin/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create ticker item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const payload = {
        ...data,
        linkUrl: data.linkUrl || null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      };
      return await apiRequest("PUT", `/api/admin/ticker/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ticker"] });
      toast({ title: "Success", description: "Ticker item updated successfully" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Session expired.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/admin/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update ticker item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ticker/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ticker"] });
      toast({ title: "Success", description: "Ticker item deleted successfully" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Session expired.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/admin/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete ticker item", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/admin/ticker/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ticker"] });
      toast({ title: "Success", description: "Status updated" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Session expired.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/admin/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "updates",
      linkUrl: "",
      priority: "50",
      endDate: "",
      isActive: true,
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: TickerItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      linkUrl: item.linkUrl || "",
      priority: item.priority,
      endDate: item.endDate ? format(new Date(item.endDate), "yyyy-MM-dd") : "",
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCategoryInfo = (categoryValue: string) => {
    return tickerCategories.find(c => c.value === categoryValue) || { label: categoryValue, color: "bg-gray-500" };
  };

  const isExpired = (item: TickerItem) => {
    if (!item.endDate) return false;
    return new Date(item.endDate) < new Date();
  };

  const getItemStatus = (item: TickerItem) => {
    if (!item.isActive) return { label: "Inactive", variant: "secondary" as const };
    if (isExpired(item)) return { label: "Expired", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const activeCount = tickerItems?.filter(item => item.isActive && !isExpired(item)).length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">News Ticker</h1>
                <p className="text-muted-foreground">Manage announcements for the homepage ticker</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-ticker">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? "Update the announcement details" : "Add a new announcement to the news ticker"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={150}
                      required
                      data-testid="input-ticker-title"
                    />
                    <p className="text-xs text-muted-foreground">Maximum 150 characters. {formData.title.length}/150</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger data-testid="select-ticker-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {tickerCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                    <Input
                      id="linkUrl"
                      type="url"
                      placeholder="https://example.com/article"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      data-testid="input-ticker-link"
                    />
                    <p className="text-xs text-muted-foreground">Users can click the announcement to visit this link</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority (0-100)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        data-testid="input-ticker-priority"
                      />
                      <p className="text-xs text-muted-foreground">Higher = first</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        data-testid="input-ticker-enddate"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty for no expiry</p>
                    </div>
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-ticker"
                    >
                      {editingItem ? "Update" : "Create"} Announcement
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Ticker Preview
              </CardTitle>
              <CardDescription>This is how the ticker will appear on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <NewsTicker previewMode />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-ticker">
                  {tickerItems?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600" data-testid="text-active-ticker">
                  {activeCount}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Announcements ({tickerItems?.length || 0})</CardTitle>
              <CardDescription>Manage your news ticker announcements</CardDescription>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <p className="text-muted-foreground">Loading announcements...</p>
              ) : tickerItems && tickerItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 font-medium">Title</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Priority</th>
                          <th className="pb-3 font-medium">End Date</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {tickerItems.map((item) => {
                          const catInfo = getCategoryInfo(item.category);
                          const status = getItemStatus(item);
                          return (
                            <tr key={item.id} className="hover-elevate" data-testid={`row-ticker-${item.id}`}>
                              <td className="py-3 pr-4">
                                <div className="font-medium">{item.title}</div>
                                {item.linkUrl && (
                                  <a 
                                    href={item.linkUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {item.linkUrl.slice(0, 40)}...
                                  </a>
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                <Badge className={`${catInfo.color} text-white`}>{catInfo.label}</Badge>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </td>
                              <td className="py-3 pr-4">{item.priority}</td>
                              <td className="py-3 pr-4 text-muted-foreground">
                                {item.endDate ? format(new Date(item.endDate), "MMM d, yyyy") : "No expiry"}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(item)}
                                    data-testid={`button-edit-ticker-${item.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleActiveMutation.mutate({ id: item.id, isActive: !item.isActive })}
                                    data-testid={`button-toggle-ticker-${item.id}`}
                                  >
                                    {item.isActive ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete this announcement?`)) {
                                        deleteMutation.mutate(item.id);
                                      }
                                    }}
                                    data-testid={`button-delete-ticker-${item.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No announcements yet</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Announcement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Category Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {tickerCategories.map((cat) => (
                  <Badge key={cat.value} className={`${cat.color} text-white`}>
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
