import { categories } from "@/data/galleriesData";

export const adminBackgroundImage = "/assets/background-pattern.png";

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time, not an ISO/UTC string.
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

// form.reset() clears the "meerdere toevoegen" checkbox; this re-checks it so the toggle stays on.
export const keepAddAnotherChecked = (form: HTMLFormElement) => {
  const checkbox = form.querySelector('input[name="addAnother"]') as HTMLInputElement | null;
  if (checkbox) checkbox.checked = true;
};

export const extractFormString = (formData: FormData, key: string) => (formData.get(key) as string) || "";
