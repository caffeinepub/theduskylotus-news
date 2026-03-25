import { Link } from "@tanstack/react-router";
import { Heart, Instagram } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footer text-footer mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo + tagline */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/screenshot_2026-03-22_at_7.58.09_pm-019d256a-3ee1-708b-bc1a-477f90be7473-1.png"
              alt="The Dusky Lotus"
              className="h-8 w-8 object-contain rounded-full bg-white p-0.5 shadow-sm"
            />
            <div>
              <div className="font-editorial text-sm font-semibold text-footer">
                TheDuskyLotus.News
              </div>
              <div className="font-body text-xs opacity-60">
                Slow journalism. Quiet stories.
              </div>
            </div>
          </div>

          {/* Center: Links */}
          <nav className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Home
            </Link>
            <a
              href="/?category=Literature"
              className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Literature
            </a>
            <a
              href="/?category=Opinion"
              className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Opinion
            </a>
            <a
              href="/?category=Features"
              className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Features
            </a>
            <Link
              to="/admin"
              className="font-body text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Admin
            </Link>
          </nav>

          {/* Right: Copyright */}
          <div className="font-body text-xs opacity-50 text-center">
            © {year} TheDuskyLotus.News
          </div>
        </div>

        {/* Instagram link */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href="https://www.instagram.com/theduskylotus.news?igsh=MTBmbGxhcnd5em9mOA=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-body text-sm font-medium bg-white/10 hover:bg-white/20 text-footer transition-all duration-200 group"
            data-ocid="footer.link"
          >
            <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Follow on Instagram
          </a>

          <span className="font-body text-xs opacity-40 inline-flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-current" />
          </span>
        </div>
      </div>
    </footer>
  );
}
