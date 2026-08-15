import { categories } from "@/data/galleriesData";

export const adminBackgroundImage = "/assets/background-pattern.png";

// Een datum-en-tijdveld in de browser wil de plaatselijke tijd in een vaste
// schrijfwijze, niet de tijd zoals ze in de database staat. Dit zet het om.
export const toDatetimeLocal = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ALBUM_TAGS = categories.filter((category) => category !== "alles");

export const formatAlbumDate = (date: string) =>
  new Date(date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export const isVideoPath = (path: string) =>
  ["mp4", "webm", "ogg", "mov", "m4v"].includes(path.split(".").pop()?.toLowerCase() ?? "");

// Een formulier leegmaken zet ook het vinkje "meerdere toevoegen" uit. Dit zet
// het terug aan, zodat je gewoon kan doorgaan met toevoegen.
export const keepAddAnotherChecked = (form: HTMLFormElement) => {
  const checkbox = form.querySelector('input[name="addAnother"]') as HTMLInputElement | null;
  if (checkbox) checkbox.checked = true;
};

export const extractFormString = (formData: FormData, key: string) => (formData.get(key) as string) || "";
