import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article, ArticleId } from "../backend.d";
import { useActor } from "./useActor";

export function usePublishedArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["publishedArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["allArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticleBySlug(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Article | null>({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArticleBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useArticleById(id: ArticleId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Article | null>({
    queryKey: ["articleById", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getArticleById(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticlesByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["articlesByCategory", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getArticlesByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useSearchArticles(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["searchArticles", searchText],
    queryFn: async () => {
      if (!actor || !searchText.trim()) return [];
      return actor.searchArticles(searchText);
    },
    enabled: !!actor && !isFetching && !!searchText.trim(),
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (article: Article) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createArticle(article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["allArticles"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      article,
    }: { id: ArticleId; article: Article }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateArticle(id, article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["allArticles"] });
      queryClient.invalidateQueries({ queryKey: ["article"] });
      queryClient.invalidateQueries({ queryKey: ["articleById"] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ArticleId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["allArticles"] });
    },
  });
}

export function useTogglePublished() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ArticleId) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.togglePublished(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["allArticles"] });
    },
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).addCategory(name) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRemoveCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).removeCategory(name) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
