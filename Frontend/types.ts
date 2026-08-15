// Alle gegevensvormen van de site op één plek. Zoek je hoe een team, evenement
// of album eruitziet, dan vind je het hier. Voeg nieuwe vormen hier ook toe.
//
// De meeste komen rechtstreeks overeen met een tabel in Supabase (zie
// supabase/migrations); de uitzonderingen staan er per stuk bij.

// --- Sponsors (tabel `sponsors`) ---
export type Sponsor = {
  id?: number;
  name: string;
  image: string;
  website_url: string | null;
};

// --- Lidgelden (tabel `membership_fees`) ---
export type MembershipFee = {
  id?: number;
  name: string;
  description: string;
  /** Prijs in hele euro's. */
  price: number;
  benefits: string[];
};

// --- Bestuursleden (tabel `board_members`) ---
export type BoardMember = {
  id?: number;
  name: string;
  function: string;
  email: string;
  /** Profielfoto in Cloudinary. */
  profile_picture: string;
};

// --- Instelbare foto's op vaste plekken (tabel `site_images`) ---
export type SiteImage = {
  id?: number;
  /** Leesbare naam, volgt automatisch uit de gekozen plek (zie data/siteImageSlots). */
  name: string;
  /** Sleutel van de plek op de site, bv. "home-hero" (zie data/siteImageSlots). */
  page: string;
  /** De foto zelf, in Cloudinary. */
  image: string;
};

/** Een vaste plek op de site waar een beheerder een foto kan instellen. */
export type SiteImageSlot = {
  /** Wordt opgeslagen in `page`; de pagina vraagt haar foto met deze sleutel op. */
  page: string;
  /** Wat de beheerder in de keuzelijst ziet. Wordt ook als `name` bewaard. */
  label: string;
};

// --- Albums en galerij (tabellen `albums` en `slideshow_images`) ---
export type Album = {
  id?: number;
  name: string;
  /** De cover, in Cloudinary. Blijft op volle kwaliteit voor de diavoorstelling. */
  cover_image: string;
  /** De foto's en filmpjes zelf. Die staan NIET in Cloudinary maar in Supabase
   *  Storage, in de map `albums`. Alleen de cover hierboven zit in Cloudinary. */
  images: string[];
  /** Datum van het album, bv. "2026-03-22". */
  date: string;
  /** Categorieën, gescheiden door komma's, bv. "jeugd,wedstrijden". */
  tags: string;
};

export type SlideshowImage = {
  id?: number;
  /** Verwijst naar een albumfoto in Supabase Storage die in de diavoorstelling hoort. */
  image_path: string;
};

export type GalleryCategory = "alles" | "wedstrijden" | "evenementen" | "jeugd" | "senioren";
export type GalleryTag = Exclude<GalleryCategory, "alles">;

export type MediaItem = {
  type: "image" | "video";
  url: string;
  caption: string;
};

/** Een album zoals de galerijpagina het toont (zie data/galleriesData). */
export type MediaGallery = {
  id: string;
  title: string;
  date: string;
  tags: GalleryTag[];
  coverImage: string;
  media: MediaItem[];
};

// --- Teams (tabellen `teams`, `players`, `staff`, `training_days`) ---
export type PlayerPosition = "Receptie Hoek" | "Opposite" | "Spelverdeler" | "Midden" | "Libero" | "All Round";
export type StaffRole = "Coach" | "Assistent-Coach" | "Trainer";
/** Onder welk kopje het team op de teampagina komt te staan. */
export type Division = "jeugd" | "dames" | "heren" | "recreatie";

export type Player = {
  id?: number;
  team_id?: number;
  name: string;
  position: PlayerPosition;
};

export type StaffMember = {
  id?: number;
  team_id?: number;
  name: string;
  role: StaffRole;
  /** Foto in Cloudinary, of null als het staflid er geen heeft. */
  photo: string | null;
};

export type TrainingDay = {
  id?: number;
  team_id?: number;
  /** Dag van de week, bv. "Maandag". */
  day: string;
  /** Vrij in te vullen uur, bv. "19:00 - 21:00". */
  time: string;
};

export type Team = {
  id?: number;
  name: string;
  description: string | null;
  /** Onder welk kopje het team op de teampagina komt te staan. */
  division: Division;
  /** Teamfoto in Cloudinary, of null als er geen is. */
  photo_url: string | null;
  /** De reeks bij de bond, bv. "LHP1". Leeg = geen wedstrijden en geen rangschikking tonen. */
  reeks: string | null;
  /** Onder welk clubnummer het team speelt. Leeg = dat van Fit Ham zelf (L-0759). */
  volley_club_id: string | null;
  players: Player[];
  staff: StaffMember[];
  training_days: TrainingDay[];
};

// --- Evenementen (tabel `events`) ---
export type ClubEvent = {
  id?: number;
  title: string;
  description: string;
  location: string;
  /** Wanneer het evenement begint. */
  start_date: string;
  /** Wanneer het gedaan is. Mag leeg blijven. */
  end_date: string | null;
  /** De affiche van het evenement, in Cloudinary. */
  image: string;
  /** Aangevinkt = dit evenement krijgt de grote kaart bovenaan (en op de homepagina). */
  highlighted: boolean;
  /** Gekoppeld fotoalbum, of null als er geen album bij hoort. */
  album_id: number | null;
  /** Aantal foto's in dat album. Staat niet in de database; wordt bij het ophalen
   *  berekend, puur om te tonen of er iets te bekijken valt. */
  albumMediaCount?: number;
};

// --- Beheerpaneel ---
export type TabType = "teams" | "photos" | "events" | "memberships" | "sponsors" | "homepage" | "contact";

// --- VolleyAdmin: wedstrijden en rangschikking van de bond.
// Komt NIET uit onze database, maar live van volleyadmin2.be (zie
// repository/volleyRepository). De veldnamen zijn die van de bond zelf. ---
/** Eén wedstrijd uit de kalender van de bond. */
export type VolleyMatch = {
  /** dd/mm/yyyy */
  datum: string;
  /** HH:mm */
  aanvangsuur: string;
  reeks: string;
  thuisploeg: string;
  bezoekersploeg: string;
  /** Leeg zolang er niet gespeeld is, daarna bv. "3-1". */
  uitslag: string;
  /** De zaal, bv. "Kwaadmechelen, Sporthal t Vlietje". */
  sporthal: string;
  stamnummer_thuisclub: string;
  stamnummer_bezoekersclub: string;
  /** Het beginuur als getal, om mee te sorteren. 0 als de datum onleesbaar was. */
  timestamp: number;
};

/** Eén rij uit de rangschikking van een reeks. */
export type VolleyRankingRow = {
  volgorde: string;
  ploegnaam: string;
  aantalGespeeldeWedstrijden: string;
  aantalGewonnenSets: string;
  aantalVerlorenSets: string;
  puntentotaal: string;
  /** Waar als deze rij een ploeg van Fit Ham is; die lichten we op in de tabel. */
  isHam: boolean;
};

// --- Zoeken op de site (geen database: zie data/searchData.ts) ---
export type SearchableContent = {
  page: string;
  path: string;
  sections: {
    title?: string;
    content: string;
  }[];
};

/** Eén treffer van het zoekvenster in de header (zie lib/siteSearch). */
export type SearchResult = {
  page: string;
  path: string;
  sectionTitle?: string;
  /** Stukje tekst rond de treffer, met "..." aan de randen. */
  snippet: string;
  /** Positie van de treffer in de tekst; wordt gebruikt om te sorteren op relevantie. */
  matchIndex: number;
};
