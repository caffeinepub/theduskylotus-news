import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ArticleId = bigint;
export interface UserProfile {
    name: string;
}
export interface Article {
    id: ArticleId;
    title: string;
    coverImageId?: string;
    published: boolean;
    createdAt: bigint;
    slug: string;
    audioFileId?: string;
    excerpt: string;
    category: string;
    bodyHtml: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArticle(article: Article): Promise<ArticleId>;
    deleteArticle(id: ArticleId): Promise<void>;
    getAllArticleSlugs(): Promise<Array<string>>;
    getAllArticles(): Promise<Array<Article>>;
    getAllCategories(): Promise<Array<string>>;
    getArticleById(id: ArticleId): Promise<Article | null>;
    getArticleBySlug(slug: string): Promise<Article | null>;
    getArticlesByCategory(category: string): Promise<Array<Article>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHomepageArticles(): Promise<Array<Article>>;
    getPublishedArticles(): Promise<Array<Article>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeCategory(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchArticles(searchText: string): Promise<Array<Article>>;
    togglePublished(id: ArticleId): Promise<void>;
    updateArticle(id: ArticleId, article: Article): Promise<void>;
}
