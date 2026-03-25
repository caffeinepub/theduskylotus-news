import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useCallback } from "react";
import { useState } from "react";
import { toast } from "sonner";
import AudioPlayer from "../components/AudioPlayer";
import { useBlobUrl } from "../hooks/useBlobUrl";
import { useArticleBySlug } from "../hooks/useQueries";
import { formatDate, getArticleUrl } from "../utils/helpers";

const SKELETON_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"];

interface ArticlePageProps {
  slug: string;
}

function HeroCover({
  coverImageId,
  title,
}: { coverImageId?: string; title: string }) {
  const blobUrl = useBlobUrl(coverImageId);
  if (blobUrl) {
    return (
      <img src={blobUrl} alt={title} className="w-full h-full object-cover" />
    );
  }
  return <div className="w-full h-full warm-gradient" />;
}

function ArticleBody({ html }: { html: string }) {
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) node.innerHTML = html;
    },
    [html],
  );
  return (
    <div
      ref={ref}
      className="article-body font-body text-foreground leading-relaxed"
    />
  );
}

export default function ArticlePage({ slug }: ArticlePageProps) {
  const { data: article, isLoading, error } = useArticleBySlug(slug);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getArticleUrl(slug));
      setCopied(true);
      toast.success("Link copied! Share it on Instagram 📎");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <main
        className="max-w-3xl mx-auto px-4 py-8"
        data-ocid="article.loading_state"
      >
        <Skeleton className="w-full rounded-2xl" style={{ height: "400px" }} />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-2 mt-8">
            {SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main
        className="max-w-3xl mx-auto px-4 py-24 text-center"
        data-ocid="article.error_state"
      >
        <h1 className="font-editorial text-3xl font-bold mb-4">
          Article not found
        </h1>
        <p className="font-body text-muted-foreground mb-8">
          The story you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-gold hover:text-gold/80"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all stories
        </Link>
      </main>
    );
  }

  return (
    <main className={article.audioFileId ? "pb-24" : ""}>
      <div className="relative" style={{ height: "420px" }}>
        <HeroCover coverImageId={article.coverImageId} title={article.title} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 pb-8">
          {article.category && (
            <span className="inline-block bg-gold text-primary-foreground font-body text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
              {article.category}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-card -mt-8 relative z-10 p-8 md:p-12 mb-8 border border-border"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-ocid="article.link"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All stories
          </Link>

          <h1 className="font-editorial text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <p className="font-body text-sm text-muted-foreground">
              {formatDate(article.createdAt)}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-primary-foreground rounded-full text-xs font-body font-semibold hover:bg-gold/90 transition-colors"
              aria-label="Copy article link"
              data-ocid="article.button"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>

          {article.excerpt && (
            <p className="font-editorial italic text-lg text-muted-foreground mb-8 leading-relaxed border-l-2 border-gold pl-4">
              {article.excerpt}
            </p>
          )}

          <ArticleBody html={article.bodyHtml} />

          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 border border-gold text-gold rounded-full text-xs font-body font-semibold hover:bg-gold hover:text-primary-foreground transition-colors"
              data-ocid="article.secondary_button"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Share this article"}
            </button>
          </div>
        </motion.article>
      </div>

      {article.audioFileId && <AudioPlayer audioFileId={article.audioFileId} />}
    </main>
  );
}
