import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ArticleId } from "../backend.d";
import { useAdminPassword } from "../hooks/useAdminPassword";
import {
  useAddCategory,
  useAllArticles,
  useAllCategories,
  useDeleteArticle,
  useRemoveCategory,
  useTogglePublished,
} from "../hooks/useQueries";
import { formatDate } from "../utils/helpers";

export default function AdminDashboardPage() {
  const { isAuthenticated, logout } = useAdminPassword();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: articles, isLoading } = useAllArticles();
  const { data: categories } = useAllCategories();
  const deleteMutation = useDeleteArticle();
  const toggleMutation = useTogglePublished();
  const addCategoryMutation = useAddCategory();
  const removeCategoryMutation = useRemoveCategory();
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  const handleDelete = async (id: ArticleId) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const handleToggle = async (id: ArticleId) => {
    try {
      await toggleMutation.mutateAsync(id);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      await addCategoryMutation.mutateAsync(name);
      setNewCategory("");
      toast.success(`Category "${name}" added`);
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleRemoveCategory = async (name: string) => {
    try {
      await removeCategoryMutation.mutateAsync(name);
      toast.success(`Category "${name}" removed`);
    } catch {
      toast.error("Failed to remove category");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Manage your articles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/editor">
            <Button
              className="bg-gold text-primary-foreground hover:bg-gold/90 font-body rounded-full gap-2"
              data-ocid="dashboard.primary_button"
            >
              <Plus className="h-4 w-4" /> New Article
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="font-body rounded-full gap-2 border-border"
            data-ocid="dashboard.secondary_button"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Articles table */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="dashboard.loading_state">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !articles || articles.length === 0 ? (
        <div
          className="text-center py-20 bg-card rounded-2xl border border-border"
          data-ocid="dashboard.empty_state"
        >
          <p className="font-editorial text-xl text-muted-foreground mb-4">
            No articles yet
          </p>
          <Link to="/admin/editor">
            <Button className="bg-gold text-primary-foreground hover:bg-gold/90 font-body rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Write your first article
            </Button>
          </Link>
        </div>
      ) : (
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden shadow-card"
          data-ocid="dashboard.table"
        >
          {articles.map((article, i) => (
            <div
              key={article.id.toString()}
              className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              data-ocid={`dashboard.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-editorial text-sm font-semibold text-foreground truncate">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-body text-xs text-muted-foreground">
                    {formatDate(article.createdAt)}
                  </span>
                  {article.category && (
                    <Badge
                      variant="secondary"
                      className="font-body text-[10px] py-0"
                    >
                      {article.category}
                    </Badge>
                  )}
                  <Badge
                    className={`font-body text-[10px] py-0 border-0 ${
                      article.published
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleToggle(article.id)}
                  disabled={toggleMutation.isPending}
                  title={article.published ? "Unpublish" : "Publish"}
                  data-ocid="dashboard.toggle"
                >
                  {toggleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : article.published ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>

                <Link
                  to="/admin/editor/$id"
                  params={{ id: article.id.toString() }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    data-ocid="dashboard.edit_button"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      data-ocid="dashboard.delete_button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="dashboard.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-editorial">
                        Delete Article?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-body">
                        This will permanently delete &quot;{article.title}
                        &quot;. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-body"
                        data-ocid="dashboard.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.id)}
                        className="bg-destructive text-destructive-foreground font-body"
                        data-ocid="dashboard.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Categories */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-editorial text-xl font-semibold text-foreground">
            Categories
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="New category name\u2026"
              className="font-body text-sm border-border"
              data-ocid="categories.input"
            />
            <Button
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || addCategoryMutation.isPending}
              className="bg-gold text-primary-foreground hover:bg-gold/90 font-body rounded-full gap-2 flex-shrink-0"
              data-ocid="categories.primary_button"
            >
              {addCategoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </div>

          {!categories || categories.length === 0 ? (
            <p
              className="font-body text-sm text-muted-foreground text-center py-6"
              data-ocid="categories.empty_state"
            >
              No categories yet. Add your first one above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2" data-ocid="categories.list">
              {categories.map((cat, i) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 bg-muted rounded-full pl-3 pr-1.5 py-1.5 group"
                  data-ocid={`categories.item.${i + 1}`}
                >
                  <span className="font-body text-sm text-foreground">
                    {cat}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    disabled={removeCategoryMutation.isPending}
                    className="p-0.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove ${cat}`}
                    data-ocid="categories.delete_button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
