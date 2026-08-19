"use client";

// De invulvelden van het inschrijvingsformulier, los gehouden van
// RegistrationModal zodat dat bestand alleen nog over het venster en het
// versturen gaat.

const labelClasses = "block text-[var(--color-primary-brand)]/70 label-regular mb-1 font-semibold";
const inputClasses =
  "w-full px-4 py-2 border-2 border-[var(--color-primary-brand)]/20 rounded-lg focus:border-[var(--color-primary-brand)] focus:outline-none transition-colors";

/** Alle velden geven hun wijziging op dezelfde manier door aan het formulier. */
type FieldChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

export function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  value: string;
  onChange: FieldChange;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClasses}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={inputClasses}
      />
    </div>
  );
}

/** Voornaam + naam naast elkaar. */
export function NameFields({
  firstName,
  lastName,
  onChange,
}: {
  firstName: string;
  lastName: string;
  onChange: FieldChange;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Voornaam *" name="playerFirstName" value={firstName} onChange={onChange} />
      <Field label="Naam *" name="playerLastName" value={lastName} onChange={onChange} />
    </div>
  );
}

/**
 * Geboortedatum met daaronder de berekende leeftijd, zodat de invuller meteen
 * ziet of de datum klopt. Het bestuur krijgt datzelfde getal in de mail.
 */
export function BirthDateField({
  value,
  age,
  onChange,
}: {
  value: string;
  age: number | null;
  onChange: FieldChange;
}) {
  return (
    <div>
      <label className={labelClasses}>Geboortedatum *</label>
      <input
        type="date"
        name="birthDate"
        value={value}
        onChange={onChange}
        required
        className={inputClasses}
      />
      {age !== null && (
        <p className="mt-1 label-small text-[var(--color-primary-brand)]/60 font-semibold">{age} jaar</p>
      )}
    </div>
  );
}

/** Vrij tekstvak waarin de inschrijver zijn eerdere volleybalervaring beschrijft. */
export function ExperienceField({
  description,
  onChange,
}: {
  description: string;
  onChange: FieldChange;
}) {
  return (
    <div>
      <label className="block text-[var(--color-primary-brand)]/70 label-regular mb-2 font-semibold">
        Eerdere volleybalervaring *
      </label>
      <textarea
        name="experienceDescription"
        value={description}
        onChange={onChange}
        required
        rows={3}
        placeholder="Beschrijf je eerdere volleybalervaring..."
        className={`${inputClasses} resize-none`}
      />
    </div>
  );
}
