"use client";

import { useState } from "react";
import { X, Upload, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ActionButton({
  onClick,
  icon: Icon,
  label,
  labelShort,
  primary,
}: {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  labelShort?: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 lg:px-5 py-2.5 lg:py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2 shadow-sm hover:shadow-md ${
        primary
          ? "bg-[var(--color-accent)] hover:bg-yellow-500 text-[var(--color-primary-brand)]"
          : "bg-white hover:bg-gray-50 text-[var(--color-primary-brand)] border border-gray-200"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="whitespace-nowrap hidden sm:inline">{label}</span>
      {labelShort && <span className="whitespace-nowrap sm:hidden">{labelShort}</span>}
    </button>
  );
}

export function IconButton({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: (event: React.MouseEvent) => void;
  icon: LucideIcon;
  label?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 lg:p-2.5 rounded-xl transition-colors flex items-center gap-2 touch-manipulation ${
        danger
          ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white active:scale-95"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)] hover:text-white active:scale-95"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label && <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block whitespace-nowrap">{label}</span>}
    </button>
  );
}

export function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
      <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
        <Search className="w-8 h-8" />
      </div>
      <p className="font-bold text-gray-500">{msg}</p>
    </div>
  );
}

export function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-[var(--color-primary-brand)] hover:bg-[var(--color-secondary-brand)] active:scale-98 text-white font-black uppercase tracking-wider py-3.5 lg:py-4 rounded-xl mt-6 transition-all shadow-lg flex items-center justify-center text-sm lg:text-[15px] touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {label}
    </button>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  isTextarea?: boolean;
}

export function InputField({ label, name, defaultValue, type = "text", required = false, isTextarea = false }: InputFieldProps) {
  const sharedClasses =
    "w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm text-gray-800 bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors placeholder:text-gray-400";
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{label}</label>
      {isTextarea ? (
        <textarea name={name} defaultValue={defaultValue} required={required} rows={4} className={`${sharedClasses} resize-none`} />
      ) : (
        <input type={type} name={name} defaultValue={defaultValue} required={required} className={sharedClasses} />
      )}
    </div>
  );
}

type ImageUploadZoneProps = {
  label: string;
  name: string;
  defaultValue?: string;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
}

type Preview = { url: string; isVideo: boolean };

export function ImageUploadZone({ label, name, defaultValue, multiple = false, accept = "image/*", required }: ImageUploadZoneProps) {
  const [previews, setPreviews] = useState<Preview[]>(defaultValue ? [{ url: defaultValue, isVideo: false }] : []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const next = Array.from(event.target.files).map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video") }));
      setPreviews(multiple ? [...previews, ...next] : [next[0]]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer group min-h-[140px]">
        <input
          type="file"
          name={multiple ? name : undefined}
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          required={required ?? (!defaultValue && !previews.length)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {previews.length > 0 ? (
          multiple ? (
            <div className="flex gap-2 overflow-x-auto w-full max-w-full pb-2 pointer-events-none">
              {previews.map((preview, previewIndex) =>
                preview.isVideo ? (
                  <video key={previewIndex} src={preview.url} className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0 bg-black" />
                ) : (
                  <img key={previewIndex} src={preview.url} alt="" className="h-16 w-16 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
                )
              )}
            </div>
          ) : previews[0].isVideo ? (
            <video src={previews[0].url} className="h-24 w-auto object-contain rounded pointer-events-none bg-black" />
          ) : (
            <img src={previews[0].url} alt="Preview" className="h-24 w-auto object-contain rounded pointer-events-none" />
          )
        ) : (
          <div className="text-center pointer-events-none text-gray-400 group-hover:text-[var(--color-primary-brand)] transition-colors">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <span className="font-bold text-sm">Klik of sleep bestand{multiple && "en"}</span>
          </div>
        )}
      </div>
      {/* Hidden input strictly for single photo form submissions containing the generated object URL */}
      {!multiple && previews.length > 0 && <input type="hidden" name={name} value={previews[0].url} />}
    </div>
  );
}

export function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100 shrink-0 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-black text-[var(--color-primary-brand)] text-lg lg:text-xl uppercase tracking-tight">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 lg:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
