"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Menu, Home as HomeIcon } from "lucide-react";
import { supabase } from "@/supabase";
import { AlbumRepository, type Album } from "@/repository/albumRepository";
import { type TabType } from "@/types";
import { adminBackgroundImage } from "@/components/sections/admin/adminHelpers";
import { SiteImagesManager } from "@/components/sections/admin/SiteImagesManager";
import { TeamsManager } from "@/components/sections/admin/TeamsManager";
import { AlbumsManager } from "@/components/sections/admin/AlbumsManager";
import { EventsManager } from "@/components/sections/admin/EventsManager";
import { BoardManager } from "@/components/sections/admin/BoardManager";
import { MembershipsManager } from "@/components/sections/admin/MembershipsManager";
import { SponsorsManager } from "@/components/sections/admin/SponsorsManager";

const albumRepository = new AlbumRepository();

const NAV_TABS: { id: TabType; label: string }[] = [
  { id: "homepage", label: "Home" },
  { id: "teams", label: "Teams" },
  { id: "photos", label: "Foto's" },
  { id: "events", label: "Evenementen" },
  { id: "contact", label: "Contact" },
  { id: "memberships", label: "Lidgeld" },
  { id: "sponsors", label: "Sponsors" },
];

const tabTitles: Record<TabType, string> = {
  teams: "Teams",
  photos: "Foto's",
  events: "Evenementen",
  memberships: "Lidgeld",
  sponsors: "Sponsors",
  homepage: "Home",
  contact: "Contact",
};

/**
 * Het beheerpaneel: de menubalk links en het actieve tabblad rechts.
 *
 * Elk tabblad regelt zijn eigen gegevens (zie sections/admin/*Manager). De
 * albums vormen de uitzondering en worden hier bijgehouden, omdat twee tabbladen
 * ze delen: bij "Foto's" beheer je ze, en bij "Evenementen" kan je er een aan
 * een evenement koppelen.
 */
export function AdminDashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Slot op het beheerpaneel. De database laat toch niets door zonder de juiste
  // rechten, maar zonder deze controle zou het beheerscherm zelf wel zichtbaar
  // zijn voor iedereen die het adres kent. We tonen dus niets tot we zeker weten
  // dat er een beheerder ingelogd is, en sturen anders door naar het inlogscherm.
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const isAdmin = (data.session?.user.app_metadata as { role?: string } | null)?.role === "admin";
      if (isAdmin) {
        setAuthChecked(true);
      } else {
        router.replace("/admin/login");
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    if (!authChecked) return;
    albumRepository.fetchAlbums().then(setAlbums);
  }, [authChecked]);

  if (!authChecked) return null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full relative flex font-sans text-gray-800 bg-slate-50">
      {/* Donkere laag achter het uitgeschoven menu op mobiel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Menubalk links met de tabbladen */}
      <aside className={`w-64 bg-[var(--color-primary-brand)] text-white flex flex-col shadow-2xl z-40 flex-shrink-0 fixed h-full transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${adminBackgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />

        <div className="p-6 relative z-10 border-b border-white/10">
          <h1 className="text-2xl font-black text-[var(--color-accent)] uppercase tracking-tighter">Admin Portaal</h1>
          <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Website Beheer</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 relative z-10 overflow-y-auto">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all group ${
                activeTab === tab.id ? "bg-white text-[var(--color-primary-brand)] shadow-md" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-black uppercase tracking-wider text-sm">{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 relative z-10">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-brand)] text-white rounded-lg transition-colors font-bold uppercase tracking-wider text-sm"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Naar website</span>
          </button>
        </div>
      </aside>

      {/* Het werkblad rechts, met het actieve tabblad */}
      <main className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden bg-white/50 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-gray-50 to-gray-100" />

        <header className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 text-[var(--color-primary-brand)] rounded-xl transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl lg:text-3xl font-black text-[var(--color-primary-brand)] uppercase tracking-tight">{tabTitles[activeTab]} Beheren</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
            <SiteImagesManager active={activeTab === "homepage"} />
            <TeamsManager active={activeTab === "teams"} />
            <AlbumsManager active={activeTab === "photos"} albums={albums} setAlbums={setAlbums} />
            <EventsManager active={activeTab === "events"} albums={albums} setAlbums={setAlbums} />
            <BoardManager active={activeTab === "contact"} />
            <MembershipsManager active={activeTab === "memberships"} />
            <SponsorsManager active={activeTab === "sponsors"} />
          </div>
        </div>
      </main>
    </div>
  );
}
