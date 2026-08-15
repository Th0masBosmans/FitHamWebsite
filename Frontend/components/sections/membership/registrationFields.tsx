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

/** Voornaam + naam naast elkaar; komt zowel bij de speler als bij de ouder voor. */
export function NameFields({
  firstNameField,
  lastNameField,
  firstName,
  lastName,
  onChange,
}: {
  firstNameField: string;
  lastNameField: string;
  firstName: string;
  lastName: string;
  onChange: FieldChange;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Voornaam *" name={firstNameField} value={firstName} onChange={onChange} />
      <Field label="Naam *" name={lastNameField} value={lastName} onChange={onChange} />
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

/**
 * Ervaringsvraag. Bij jeugd volstaat ja/nee; volwassenen typen zelf uit wat ze
 * al gespeeld hebben.
 */
export function ExperienceField({
  isYouth,
  hasExperience,
  description,
  onChange,
}: {
  isYouth: boolean;
  hasExperience: string;
  description: string;
  onChange: FieldChange;
}) {
  return (
    <div>
      <label className="block text-[var(--color-primary-brand)]/70 label-regular mb-2 font-semibold">
        {isYouth ? "Eerder gevolleybald? *" : "Eerdere volleybalervaring *"}
      </label>

      {isYouth ? (
        <div className="flex gap-4">
          {[
            { value: "ja", label: "Ja" },
            { value: "nee", label: "Nee" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasExperience"
                value={option.value}
                checked={hasExperience === option.value}
                onChange={onChange}
                required
                className="w-4 h-4 text-[var(--color-primary-brand)] focus:ring-[var(--color-primary-brand)]"
              />
              <span className="text-[var(--color-primary-brand)] font-semibold">{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          name="experienceDescription"
          value={description}
          onChange={onChange}
          required
          rows={3}
          placeholder="Beschrijf je eerdere volleybalervaring..."
          className={`${inputClasses} resize-none`}
        />
      )}
    </div>
  );
}
