/**
 * Leeftijd in hele jaren op vandaag. Geeft null terug bij een onmogelijke datum
 * (leeg, in de toekomst, of ouder dan 120).
 *
 * Staat hier apart omdat twee plekken hetzelfde getal moeten tonen: het
 * inschrijvingsformulier (sections/membership/RegistrationModal) laat het live
 * zien onder de geboortedatum, en /api/registration zet het in de mail naar het
 * bestuur. Zo kan dat nooit uit elkaar lopen.
 */
export function calculateAge(birthDate: string): number | null {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  // Verjaardag dit jaar nog niet geweest? Dan een jaar eraf.
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 && age < 120 ? age : null;
}
