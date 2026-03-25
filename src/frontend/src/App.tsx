import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ArticleEditorPage from "./pages/ArticleEditorPage";
import ArticlePage from "./pages/ArticlePage";
import HomePage from "./pages/HomePage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/article/$slug",
  component: () => {
    const params = articleRoute.useParams();
    return <ArticlePage slug={params.slug} />;
  },
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminEditorNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/editor",
  component: () => <ArticleEditorPage />,
});

const adminEditorEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/editor/$id",
  component: () => {
    const params = adminEditorEditRoute.useParams();
    return <ArticleEditorPage articleId={BigInt(params.id)} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  articleRoute,
  adminLoginRoute,
  adminDashboardRoute,
  adminEditorNewRoute,
  adminEditorEditRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
