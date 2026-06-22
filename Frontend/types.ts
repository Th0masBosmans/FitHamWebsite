// Single source of truth for app types. Add new types here.
// Everything is a `type` alias: this app uses only object shapes and unions, for
// which `type` and `interface` are interchangeable (no declaration merging needed).

// --- Sponsors ---
export type Sponsor = {
  id?: number;
  name: string;
  image: string;
  website_url: string | null;
};

// --- Memberships ---
export type MembershipFee = {
  id?: number;
  name: string;
  description: string;
  /** Price in whole euros (integer in the database). */
  price: number;
  benefits: string[];
};

// --- Board ---
export type BoardMember = {
  id?: number;
  name: string;
  function: string;
  email: string;
  /** Cloudinary public id. */
  profile_picture: string;
};

// --- Site images ---
export type SiteImage = {
  id?: number;
  /** Human-friendly label, derived from the chosen slot (see SITE_IMAGE_SLOTS). */
  name: string;
  /** Slot key identifying the spot on the site (see SITE_IMAGE_SLOTS). */
  page: string;
  /** Cloudinary public id. */
  image: string;
};

/** A predefined spot on the site that can hold a managed image (see SITE_IMAGE_SLOTS). */
export type SiteImageSlot = {
  /** Value stored in `page`; consumers fetch their image by this key. */
  page: string;
  /** Human-friendly label shown in the admin panel and stored as `name`. */
  label: string;
};

// --- Albums & gallery ---
export type Album = {
  id?: number;
  name: string;
  /** Cloudinary public id of the cover image (kept full quality for the slideshow). */
  cover_image: string;
  /** Storage paths (keys) of the album's images/videos in the `albums` bucket. */
  images: string[];
  /** ISO date (date in the database), e.g. "2026-03-22". */
  date: string;
  /** Comma-separated category tags (see GalleryTag). */
  tags: string;
};

export type SlideshowImage = {
  id?: number;
  /** Storage key (in the `albums` bucket) of an album photo shown in the gallery hero slideshow. */
  image_path: string;
};

export type GalleryCategory = "alles" | "wedstrijden" | "evenementen" | "jeugd" | "senioren";
export type GalleryTag = Exclude<GalleryCategory, "alles">;

export type MediaItem = {
  type: "image" | "video";
  url: string;
  caption: string;
};

/** An album mapped onto the shape the gallery UI renders (see albumToGallery). */
export type MediaGallery = {
  id: string;
  title: string;
  date: string;
  tags: GalleryTag[];
  coverImage: string;
  media: MediaItem[];
};

// --- Teams ---
export type PlayerPosition = "Receptie Hoek" | "Opposite" | "Spelverdeler" | "Midden" | "Libero" | "All Round";
export type StaffRole = "Coach" | "Assistent-Coach" | "Trainer";
/** Section the team is grouped under on the public Teams page. */
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
  /** Cloudinary public id, or null when the staff member has no photo. */
  photo: string | null;
};

export type TrainingDay = {
  id?: number;
  team_id?: number;
  /** Weekday in Dutch, e.g. "Maandag". */
  day: string;
  /** Free-form time range, e.g. "19:00 - 21:00". */
  time: string;
};

export type Team = {
  id?: number;
  name: string;
  description: string | null;
  /** Section the team is grouped under on the public Teams page. */
  division: Division;
  /** Cloudinary public id of the team photo, or null when none. */
  photo_url: string | null;
  /** VolleyAdmin series code (e.g. "LHP1"); null when the team has no competition feed. */
  reeks: string | null;
  /** stamnummer the team plays under; null falls back to the club default (L-0759). */
  volley_club_id: string | null;
  players: Player[];
  staff: StaffMember[];
  training_days: TrainingDay[];
};

// --- Events ---
export type ClubEvent = {
  id?: number;
  title: string;
  description: string;
  location: string;
  /** ISO timestamp (timestamptz in the database). */
  start_date: string;
  /** Optional end of the event. */
  end_date: string | null;
  /** Cloudinary public id. */
  image: string;
  highlighted: boolean;
  /** Linked photo album (albums.id), or null when the event has none. */
  album_id: number | null;
  /** Media count of the linked album; set by fetchEvents (0 when unlinked/empty). Display-only. */
  albumMediaCount?: number;
};

// --- Admin dashboard ---
export type TabType = "teams" | "photos" | "events" | "memberships" | "sponsors" | "homepage" | "contact";

// --- VolleyAdmin (live competition data) ---
/** One match from the club calendar (wedstrijden_xml). */
export type VolleyMatch = {
  /** dd/mm/yyyy */
  datum: string;
  /** HH:mm */
  aanvangsuur: string;
  reeks: string;
  thuisploeg: string;
  bezoekersploeg: string;
  /** Empty before the match is played, e.g. "3-1" afterwards. */
  uitslag: string;
  /** Venue, e.g. "Kwaadmechelen, Sporthal t Vlietje". */
  sporthal: string;
  stamnummer_thuisclub: string;
  stamnummer_bezoekersclub: string;
  /** Epoch ms of kickoff, or 0 when the date/time could not be parsed. */
  timestamp: number;
};

/** One row of a series' standings (rangschikking_xml). */
export type VolleyRankingRow = {
  volgorde: string;
  ploegnaam: string;
  aantalGespeeldeWedstrijden: string;
  aantalGewonnenSets: string;
  aantalVerlorenSets: string;
  puntentotaal: string;
  /** True when this row is a Fit V.B.C. Ham team (used to highlight it). */
  isHam: boolean;
};

// --- Site search ---
export type SearchableContent = {
  page: string;
  path: string;
  sections: {
    title?: string;
    content: string;
  }[];
};
