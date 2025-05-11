import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Settings,
  User,
  FileText,
  BarChart,
  Mail,
  X,
  Calendar,
  Users
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Interviews",
    href: "/interviews",
    icon: Calendar,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/setting",
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActiveLink = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background shadow-lg transition-transform lg:static",
          isOpen ? "transform-none" : "-translate-x-full lg:transform-none"
        )}
      >
        <div className="flex h-14 items-center border-b px-4 lg:h-16 lg:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold"
          >
            <BarChart className="h-6 w-6" />
            <span>Interview Manager</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-3 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
} 