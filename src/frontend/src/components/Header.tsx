import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useAdminPassword } from "../hooks/useAdminPassword";
import { useAllCategories } from "../hooks/useQueries";

const NAV_LINKS = [
  { label: "Art & Culture", href: "/?category=Art+%26+Culture" },
  { label: "Literature", href: "/?category=Literature" },
  { label: "Opinion", href: "/?category=Opinion" },
  { label: "Features", href: "/?category=Features" },
  { label: "Archive", href: "/?category=Archive" },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { data: categories } = useAllCategories();
  const { isAuthenticated } = useAdminPassword();

  const dynamicLinks =
    categories && categories.length > 0
      ? categories.slice(0, 5).map((cat) => ({
          label: cat,
          href: `/?category=${encodeURIComponent(cat)}`,
        }))
      : NAV_LINKS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/", search: { q: searchQuery } });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            data-ocid="header.link"
          >
            <img
              src="/assets/uploads/screenshot_2026-03-22_at_7.58.09_pm-019d256a-3ee1-708b-bc1a-477f90be7473-1.png"
              alt="The Dusky Lotus"
              className="h-9 w-9 object-contain rounded-full bg-white p-0.5 shadow-sm"
            />
            <div className="hidden sm:block">
              <div className="font-editorial text-base font-bold text-foreground leading-tight">
                TheDuskyLotus
              </div>
              <div className="font-body text-[10px] text-muted-foreground tracking-widest uppercase">
                .News
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className="font-body text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
              data-ocid="nav.link"
            >
              Home
            </Link>
            {dynamicLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Search + Admin */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="h-8 w-48 text-sm bg-background border-border"
                  autoFocus
                  data-ocid="header.search_input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                aria-label="Search"
                data-ocid="header.search_input"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
            {isAuthenticated ? (
              <Link to="/admin/dashboard">
                <Button
                  size="sm"
                  className="bg-gold text-primary-foreground hover:bg-gold/90 font-body text-xs rounded-full px-4 hidden sm:flex"
                  data-ocid="header.button"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/admin">
                <Button
                  size="sm"
                  className="bg-gold text-primary-foreground hover:bg-gold/90 font-body text-xs rounded-full px-4 hidden sm:flex"
                  data-ocid="header.button"
                >
                  Admin Login
                </Button>
              </Link>
            )}
            {/* Mobile menu */}
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-border mt-0 pt-3">
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="font-body text-sm text-foreground px-3 py-2 rounded-md hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              {dynamicLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-gold text-primary-foreground font-body text-xs rounded-full"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-gold text-primary-foreground font-body text-xs rounded-full"
                  >
                    Admin Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
