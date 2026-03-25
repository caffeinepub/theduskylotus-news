import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAllCategories } from "../hooks/useQueries";

const DEFAULT_CATEGORIES = [
  "Lifestyle",
  "New",
  "Global Trends",
  "Politics",
  "Culture",
  "Opinion",
];

export default function CategoryBar() {
  const { data: fetchedCategories } = useAllCategories();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { category?: string };
  const activeCategory = searchParams.category || "";

  const categories =
    fetchedCategories && fetchedCategories.length > 0
      ? fetchedCategories
      : DEFAULT_CATEGORIES;

  const handleCategoryClick = (cat: string) => {
    if (cat === "All") {
      navigate({ to: "/", search: {} });
    } else {
      navigate({ to: "/", search: { category: cat } });
    }
  };

  return (
    <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div
        className="flex items-center gap-2 px-4 py-3 overflow-x-auto"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        {["All", ...categories].map((cat) => {
          const isActive =
            cat === "All" ? !activeCategory : activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 font-body text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gold text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              data-ocid="categories.tab"
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
