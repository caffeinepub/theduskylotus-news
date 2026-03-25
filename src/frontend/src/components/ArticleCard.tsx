import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Article } from "../backend.d";
import { useBlobUrl } from "../hooks/useBlobUrl";
import { formatDate, getArticleUrl } from "../utils/helpers";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

function CoverImage({
  coverImageId,
  title,
}: { coverImageId?: string; title: string }) {
  const blobUrl = useBlobUrl(coverImageId);

  if (blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="w-full h-full warm-gradient flex items-center justify-center">
      <img
        src="/assets/uploads/screenshot_2026-03-22_at_7.58.09_pm-019d256a-3ee1-708b-bc1a-477f90be7473-1.png"
        alt=""
        className="h-16 w-16 object-contain opacity-30"
      />
    </div>
  );
}

export default function ArticleCard({ article, index = 1 }: ArticleCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getArticleUrl(article.slug));
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <article
      className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-hero transition-shadow duration-300 flex flex-col"
      data-ocid={`articles.item.${index}`}
    >
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="block"
      >
        <div className="aspect-[16/10] overflow-hidden relative">
          <CoverImage
            coverImageId={article.coverImageId}
            title={article.title}
          />
          {article.category && (
            <Badge className="absolute top-3 left-3 bg-gold text-primary-foreground font-body text-[10px] font-medium tracking-wide border-0">
              {article.category}
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <h3 className="font-editorial text-lg font-semibold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors">
            {article.title}
          </h3>
        </Link>

        <p className="font-body text-xs text-muted-foreground mb-3">
          {formatDate(article.createdAt)}
        </p>

        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <Link
            to="/article/$slug"
            params={{ slug: article.slug }}
            className="font-body text-xs text-gold hover:text-gold/80 font-medium transition-colors"
            data-ocid="articles.link"
          >
            Read Article →
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-primary-foreground rounded-full text-xs font-body font-medium hover:bg-gold/90 transition-colors"
            aria-label="Copy article link"
            data-ocid="articles.button"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
