import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Article } from "../backend.d";
import { useBlobUrl } from "../hooks/useBlobUrl";
import { formatDate } from "../utils/helpers";

interface HeroSectionProps {
  article: Article;
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

export default function HeroSection({ article }: HeroSectionProps) {
  return (
    <section
      className="relative rounded-2xl overflow-hidden shadow-hero mb-12"
      style={{ height: "520px" }}
      data-ocid="hero.section"
    >
      <HeroCover coverImageId={article.coverImageId} title={article.title} />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {article.category && (
          <span className="inline-block bg-gold text-primary-foreground font-body text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
            {article.category}
          </span>
        )}
        <h1 className="font-editorial text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 max-w-3xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="font-body text-white/80 text-sm md:text-base mb-4 max-w-xl line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4">
          <span className="font-body text-white/60 text-xs">
            {formatDate(article.createdAt)}
          </span>
          <Link
            to="/article/$slug"
            params={{ slug: article.slug }}
            className="inline-flex items-center gap-2 bg-gold text-primary-foreground font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gold/90 transition-colors"
            data-ocid="hero.primary_button"
          >
            Read Article →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
