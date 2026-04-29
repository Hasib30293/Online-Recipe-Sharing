import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import cookbookLogo from "@/assets/CookBook_logo_cropped.png";
import cookbookLogoDark from "@/assets/CookBook_logo_cropped_dark.png";

const navLinks = [
  { label: "Home", href: "/", section: "home" },
  { label: "Recipes", href: "/recipes", section: "recipes" },
  { label: "Community", href: "/community", section: "community" },
  { label: "About", href: "/#about", section: "about" },
];

const AuthActionsSkeleton = ({ mobile = false }: { mobile?: boolean }) => {
  if (mobile) {
    return (
      <div className="space-y-3 pt-2">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-10 w-28 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { user, loading, signOut } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    if (location.hash) {
      setActiveSection(location.hash.replace("#", ""));
    } else {
      setActiveSection("home");
    }

    const sectionIds = navLinks.map((link) => link.section);
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  const displayName =
    user?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl = user?.avatarUrl ?? undefined;
  const email = user?.email ?? "hello@cookbook.local";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isNavItemActive = (section: string, href: string) => {
    // Hash-based links (e.g. /#about): active only on home with matching section
    if (href.startsWith("/#")) {
      return location.pathname === "/" && activeSection === section;
    }
    // Home exact match
    if (href === "/") {
      return location.pathname === "/";
    }
    // Other pages: active when pathname starts with href
    return location.pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F2EEE8] dark:bg-background/95 backdrop-blur-md shadow-card"
          : "bg-[#F2EEE8] dark:bg-transparent"
      }`}
    >
      <div className="container mx-auto grid h-20 grid-cols-3 items-center px-4 lg:px-8">
        {/* Left – logo */}
        <Link to="/" className="flex items-center">
          <img
            src={cookbookLogo}
            alt="CookBook"
            className="block h-16 w-auto -translate-y-1 object-contain dark:hidden"
            loading="eager"
          />
          <img
            src={cookbookLogoDark}
            alt="CookBook"
            className="hidden h-16 w-auto -translate-y-1 object-contain dark:block"
            loading="eager"
          />
        </Link>

        {/* Centre – nav links */}
        <div className="hidden md:flex items-center justify-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.section}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isNavItemActive(link.section, link.href) ? "text-primary" : "text-black dark:text-white",
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right – actions */}
        <div className="hidden md:flex items-center justify-end gap-3">
          <ThemeToggle />
          {loading ? (
            <AuthActionsSkeleton />
          ) : isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigate("/post-recipe")}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <PlusCircle className="h-4 w-4" />
                Post Recipe
              </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-secondary transition-colors p-1 pr-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{displayName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-1">
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-xs font-normal text-muted-foreground">{email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserRound className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-recipes")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Recipes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth?tab=register")}
                className="h-9 px-5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden col-start-3 justify-self-end p-2"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.section}
                  type="button"
                  onClick={() => handleNavigate(link.href)}
                  className={cn(
                    "block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    isNavItemActive(link.section, link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-black dark:text-white hover:bg-secondary",
                  )}
                >
                  {link.label}
                </button>
              ))}
              {loading ? (
                <AuthActionsSkeleton mobile />
              ) : isAuthenticated ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/post-recipe")}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post Recipe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className="w-full h-10 text-sm font-medium border border-border rounded-full"
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/my-recipes")}
                    className="w-full h-10 text-sm font-medium border border-border rounded-full"
                  >
                    My Recipes
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full h-10 text-sm font-medium border border-border rounded-full"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/auth")}
                    className="flex-1 h-10 text-sm font-medium border border-border rounded-full"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("/auth?tab=register")}
                    className="flex-1 h-10 text-sm font-medium bg-primary text-primary-foreground rounded-full"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
