import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import ArticleCard from "../components/ArticleCard";
import CategoryBar from "../components/CategoryBar";
import HeroSection from "../components/HeroSection";
import { usePublishedArticles, useSearchArticles } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"];

export default function HomePage() {
  const searchParams = useSearch({ strict: false }) as {
    q?: string;
    category?: string;
  };
  const activeCategory = searchParams.category || "";
  const searchQuery = searchParams.q || "";

  const { data: articles, isLoading } = usePublishedArticles();
  const { data: searchResults, isLoading: isSearching } =
    useSearchArticles(searchQuery);

  const displayArticles = useMemo(() => {
    if (searchQuery && searchResults) return searchResults;
    if (!articles) return [];
    if (activeCategory)
      return articles.filter((a) => a.category === activeCategory);
    return articles;
  }, [articles, searchResults, searchQuery, activeCategory]);

  const heroArticle = articles && articles.length > 0 ? articles[0] : null;
  const gridArticles =
    searchQuery || activeCategory ? displayArticles : displayArticles.slice(1);

  const loading = isLoading || (!!searchQuery && isSearching);

  return (
    <main className="min-h-screen">
      <CategoryBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {(activeCategory || searchQuery) && (
          <div className="mb-8">
            <h2 className="font-editorial text-2xl font-semibold text-foreground">
              {searchQuery ? `Search: "${searchQuery}"` : activeCategory}
            </h2>
            <div className="mt-1 w-16 h-0.5 bg-gold rounded" />
          </div>
        )}

        {loading ? (
          <div data-ocid="home.loading_state">
            <Skeleton
              className="w-full rounded-2xl"
              style={{ height: "520px" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {SKELETON_KEYS.map((key) => (
                <div
                  key={key}
                  className="bg-card rounded-2xl overflow-hidden border border-border"
                >
                  <Skeleton className="w-full aspect-[16/10]" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-24" data-ocid="home.empty_state">
            <img
              src="/assets/uploads/screenshot_2026-03-22_at_7.58.09_pm-019d256a-3ee1-708b-bc1a-477f90be7473-1.png"
              alt=""
              className="h-20 w-20 object-contain mx-auto mb-6 opacity-30"
            />
            <h2 className="font-editorial text-2xl font-semibold text-foreground mb-2">
              {searchQuery ? "No articles found" : "No stories yet"}
            </h2>
            <p className="font-body text-muted-foreground text-sm">
              {searchQuery
                ? `We couldn't find anything for "${searchQuery}". Try a different search.`
                : "The first story is on its way. Check back soon."}
            </p>
          </div>
        ) : (
          <>
            {!activeCategory && !searchQuery && heroArticle && (
              <HeroSection article={heroArticle} />
            )}

            {gridArticles.length > 0 && (
              <>
                {!activeCategory && !searchQuery && (
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="font-editorial text-xl font-semibold text-foreground">
                      Latest Stories
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  data-ocid="articles.list"
                >
                  {gridArticles.map((article, i) => (
                    <motion.div
                      key={article.slug}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <ArticleCard article={article} index={i + 1} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
