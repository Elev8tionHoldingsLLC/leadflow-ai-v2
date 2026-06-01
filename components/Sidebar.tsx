"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  Download,
  Home,
  Map,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { fetchProfile } from "@/lib/database/profile";
import AuthButton from "@/components/AuthButton";

const sidebarLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/analyzer", label: "Analyzer", icon: Brain },
  { href: "/deals", label: "Deals", icon: Building2 },
  { href: "/buyers", label: "Buyers", icon: Users },
  { href: "/markets", label: "Markets", icon: Map },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/search", label: "Search", icon: Search },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/export", label: "Export", icon: Download },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/personalization", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);

  useEffect(() => {
    async function loadProfile() {
      try {
        const fetchedProfile = await fetchProfile();
        setProfile(fetchedProfile);
      } catch {
        setProfile(DEFAULT_PROFILE);
      }
    }

    loadProfile();
  }, []);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed left-0 top-0 z-50 h-screen overflow-hidden border-r border-cyan-400/20 bg-zinc-950 transition-all duration-300 ${
        expanded ? "w-72" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col p-3">
        <Link
          href="/"
          className={`mb-8 overflow-hidden border border-cyan-400/20 bg-black shadow-[0_0_25px_rgba(34,211,238,0.08)] transition-all duration-300 ${
            expanded ? "rounded-2xl p-3" : "mx-auto h-14 w-14 rounded-2xl p-2"
          }`}
        >
          {expanded ? (
            <div className="flex items-center gap-3">
              <ProfileImage src={profile.profileImage} size="large" />

              <div className="min-w-0">
                <p className="truncate font-black text-white">
                  {profile.displayName}
                </p>
                <p className="truncate text-xs font-semibold text-cyan-400">
                  {profile.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ProfileImage src={profile.profileImage} size="small" />
            </div>
          )}
        </Link>

        <nav className="no-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto">
          {sidebarLinks.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              expanded={expanded}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="mt-6">
  <AuthButton expanded={expanded} />
</div>
        <div
          className={`mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/10 transition-all duration-300 ${
            expanded ? "p-3" : "h-12 w-12 self-center p-2"
          }`}
        >
          {expanded ? (
            <p className="truncate text-center text-xs font-bold text-cyan-300">
              {profile.tagline}
            </p>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-cyan-400/10 text-xs font-black text-cyan-300">
              LF
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function ProfileImage({
  src,
  size,
}: {
  src: string;
  size: "small" | "large";
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-cyan-400/30 ${
        size === "large" ? "h-12 w-12" : "h-10 w-10"
      }`}
    >
      <img
        src={src || DEFAULT_PROFILE.profileImage}
        alt="Profile"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  expanded,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  expanded: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center border px-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(34,211,238,0.18)] ${
        expanded
          ? "w-full rounded-3xl py-3"
          : "w-14 justify-center self-center rounded-3xl py-3"
      } ${
        active
          ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-400"
          : "border-transparent text-zinc-400 hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-cyan-400"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-all duration-300 ${
          expanded ? "mr-4 group-hover:-translate-x-1" : "group-hover:scale-110 group-hover:rotate-3"
        }`}
      />

      {expanded && (
        <span className="whitespace-nowrap text-sm font-semibold">
          {label}
        </span>
      )}
    </Link>
  );
}