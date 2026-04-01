import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Music, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Article, ArticleId } from "../backend.d";
import { useAdminPassword } from "../hooks/useAdminPassword";
import { useBlobUrl, useFileUpload } from "../hooks/useBlobUrl";
import {
  useArticleById,
  useCreateArticle,
  useUpdateArticle,
} from "../hooks/useQueries";
import { slugify } from "../utils/helpers";

interface ArticleEditorPageProps {
  articleId?: ArticleId;
}

const CATEGORIES = [
  "Art & Culture",
  "Literature",
  "Opinion",
  "Features",
  "Archive",
  "Lifestyle",
  "Travel",
];

export default function ArticleEditorPage({
  articleId,
}: ArticleEditorPageProps) {
  const { isAuthenticated } = useAdminPassword();
  const navigate = useNavigate();
  const { data: existingArticle, isLoading: loadingArticle } =
    useArticleById(articleId);
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const {
    upload: uploadFileBlob,
    uploading: uploadingImage,
    progress: imageProgress,
  } = useFileUpload();
  const {
    upload: uploadAudioBlob,
    uploading: uploadingAudio,
    progress: audioProgress,
  } = useFileUpload();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [published, setPublished] = useState(false);
  const [coverImageId, setCoverImageId] = useState<string | undefined>();
  const [audioFileId, setAudioFileId] = useState<string | undefined>();
  const [slugManuallySet, setSlugManuallySet] = useState(false);

  const coverImageUrl = useBlobUrl(coverImageId);
  const audioUrl = useBlobUrl(audioFileId);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/admin" });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSlug(existingArticle.slug);
      setExcerpt(existingArticle.excerpt);
      setCategory(existingArticle.category);
      setBodyHtml(existingArticle.bodyHtml);
      setPublished(existingArticle.published);
      setCoverImageId(existingArticle.coverImageId);
      setAudioFileId(existingArticle.audioFileId);
      setSlugManuallySet(true);
    }
  }, [existingArticle]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallySet) {
      setSlug(slugify(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
    try {
      const hash = await uploadFileBlob(file);
      setCoverImageId(hash);
      toast.success("Cover image uploaded");
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const hash = await uploadAudioBlob(file);
      setAudioFileId(hash);
      toast.success("Audio file uploaded");
    } catch (err) {
      console.error("Audio upload error:", err);
      toast.error("Failed to upload audio. Please try again.");
    }
  };

  const buildArticle = (pub: boolean, resolvedSlug: string): Article => ({
    id: articleId ?? BigInt(0),
    title: title.trim() || "Untitled Draft",
    slug: resolvedSlug,
    excerpt: excerpt.trim(),
    category: category.trim(),
    bodyHtml,
    published: pub,
    createdAt:
      existingArticle?.createdAt ?? BigInt(Date.now()) * BigInt(1_000_000),
    coverImageId: coverImageId || undefined,
    audioFileId: audioFileId || undefined,
  });

  const handleSave = async (pub: boolean) => {
    // For publishing, require a title
    if (pub && !title.trim()) {
      toast.error("A title is required to publish");
      return;
    }
    // Auto-generate slug if not set
    const resolvedSlug =
      slug.trim() || slugify(title.trim() || `draft-${Date.now()}`);

    // Update slug state so user can see what was auto-generated
    if (!slug.trim()) {
      setSlug(resolvedSlug);
    }

    try {
      if (articleId !== undefined) {
        await updateMutation.mutateAsync({
          id: articleId,
          article: buildArticle(pub, resolvedSlug),
        });
        toast.success(pub ? "Article published!" : "Draft saved");
      } else {
        await createMutation.mutateAsync(buildArticle(pub, resolvedSlug));
        toast.success(pub ? "Article published!" : "Draft saved");
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(
        "Failed to save. Please check you are logged in and try again.",
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingArticle) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="editor.loading_state"
      >
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-editorial text-3xl font-bold text-foreground">
          {articleId ? "Edit Article" : "New Article"}
        </h1>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/admin/dashboard" })}
          className="font-body text-muted-foreground"
        >
          ← Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="font-body text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter article title…"
            className="font-editorial text-lg h-12 bg-card border-border"
            data-ocid="editor.input"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="font-body text-sm font-medium">
            URL Slug
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallySet(true);
            }}
            placeholder="auto-generated from title"
            className="font-body h-10 bg-card border-border"
            data-ocid="editor.input"
          />
          <p className="font-body text-xs text-muted-foreground">
            URL: /article/{slug || "auto-generated"}
          </p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="font-body text-sm font-medium">
            Category
          </Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full font-body text-xs border transition-colors ${
                  category === cat
                    ? "bg-gold text-primary-foreground border-gold"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
                data-ocid="editor.button"
              >
                {cat}
              </button>
            ))}
          </div>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Or type a custom category…"
            className="font-body h-10 bg-card border-border"
            data-ocid="editor.input"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <Label htmlFor="excerpt" className="font-body text-sm font-medium">
            Excerpt
          </Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description shown in cards and hero…"
            className="font-body bg-card border-border resize-none"
            rows={3}
            data-ocid="editor.textarea"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-1.5">
          <Label className="font-body text-sm font-medium">Cover Image</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-4 bg-card">
            {coverImageUrl ? (
              <div className="relative">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageId(undefined)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                  data-ocid="editor.close_button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                data-ocid="editor.upload_button"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="font-body text-sm text-muted-foreground">
                  {uploadingImage
                    ? `Uploading… ${imageProgress}%`
                    : "Click to upload cover image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>

        {/* Audio */}
        <div className="space-y-1.5">
          <Label className="font-body text-sm font-medium">
            Audio File (optional)
          </Label>
          <div className="border-2 border-dashed border-border rounded-xl p-4 bg-card">
            {audioFileId ? (
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-gold" />
                {audioUrl && (
                  // biome-ignore lint/a11y/useMediaCaption: preview audio for admin only
                  <audio src={audioUrl} controls className="flex-1 h-8" />
                )}
                <button
                  type="button"
                  onClick={() => setAudioFileId(undefined)}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="editor.close_button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center h-20 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                data-ocid="editor.upload_button"
              >
                <Music className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="font-body text-sm text-muted-foreground">
                  {uploadingAudio
                    ? `Uploading… ${audioProgress}%`
                    : "Click to upload audio (MP3, WAV, etc.)"}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                />
              </label>
            )}
          </div>
        </div>

        {/* Body HTML */}
        <div className="space-y-1.5">
          <Label htmlFor="body" className="font-body text-sm font-medium">
            Article Body (HTML)
          </Label>
          <Textarea
            id="body"
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="<p>Write your article here. You can use HTML tags for formatting.</p>"
            className="font-body bg-card border-border resize-none font-mono text-sm"
            rows={16}
            data-ocid="editor.textarea"
          />
          <p className="font-body text-xs text-muted-foreground">
            You can use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;,
            &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;, &lt;ul&gt;,
            &lt;li&gt;, etc.
          </p>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
          <Switch
            id="publish"
            checked={published}
            onCheckedChange={setPublished}
            data-ocid="editor.switch"
          />
          <Label htmlFor="publish" className="font-body text-sm cursor-pointer">
            {published ? "Published" : "Draft"} —{" "}
            {published ? "visible to all readers" : "only visible to you"}
          </Label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            variant="outline"
            className="font-body rounded-full border-border"
            data-ocid="editor.secondary_button"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="bg-gold text-primary-foreground hover:bg-gold/90 font-body rounded-full"
            data-ocid="editor.submit_button"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Publish Article
          </Button>
        </div>
      </div>
    </main>
  );
}
