import { ChevronDown, ChevronUp, Camera, Edit2, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconButton } from "./AdminControls";

type ExpandableListItemProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  image?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  details?: { label: string; value: React.ReactNode }[];
  description?: string;
  // Toont de uitgeklapte afbeelding als brede banner i.p.v. de smalle vierkante spot.
  wideImage?: boolean;
  children?: React.ReactNode;
}

export function ExpandableListItem({
  title,
  subtitle,
  icon: Icon,
  image,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  details = [],
  description,
  wideImage = false,
  children,
}: ExpandableListItemProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:border-[var(--color-primary-brand)]/30 mb-4">
      {/* Collapsed / Header View */}
      <div
        onClick={onToggle}
        className="p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-3 lg:gap-4"
      >
        <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[var(--color-primary-brand)]/10 text-[var(--color-primary-brand)] flex items-center justify-center shrink-0 overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-lg lg:text-xl text-gray-800 uppercase tracking-tight truncate">{title}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <IconButton onClick={(clickEvent) => { clickEvent.stopPropagation(); onEdit(); }} icon={Edit2} label="Bewerk" />
          {onDelete ? (
            <IconButton onClick={(clickEvent) => { clickEvent.stopPropagation(); onDelete(); }} icon={Trash2} label="Verwijder" danger />
          ) : (
            <div className="invisible pointer-events-none w-[42px]" aria-hidden="true">
              <IconButton onClick={() => {}} icon={Trash2} label="Verwijder" danger />
            </div>
          )}
          <div className="w-px h-6 lg:h-8 bg-gray-200 mx-1 lg:mx-2"></div>
          <div className={`p-1.5 lg:p-2 rounded-xl transition-colors ${isExpanded ? "bg-[var(--color-primary-brand)] text-white" : "bg-gray-100 text-gray-500"}`}>
            {isExpanded ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Details View */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 lg:p-8 animate-in fade-in duration-200">
          <div className={`flex flex-col ${wideImage ? "" : "lg:flex-row"} gap-4 lg:gap-8 mb-4 lg:mb-6`}>
            {/* Uniform Image Spot */}
            {image !== undefined && (
              <div className={`w-full ${wideImage ? "aspect-video" : "lg:w-64 aspect-video lg:aspect-square"} shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2 relative`}>
                {image ? (
                  <img src={image} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-6 lg:w-8 h-6 lg:h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Geen afbeelding</span>
                  </div>
                )}
              </div>
            )}

            {/* Uniform Details Grid */}
            <div className="flex-1 space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {details.map((detail, index) => (
                  <div key={index} className="bg-white p-3 lg:p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{detail.label}</span>
                    <div className="text-sm font-bold text-gray-800 break-words">{detail.value}</div>
                  </div>
                ))}
              </div>
              {description && (
                <div className="bg-white p-4 lg:p-5 rounded-xl border border-gray-100 shadow-sm">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-brand)] mb-2">Beschrijving</span>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Uniform Children Area (Players list, Photos grid, etc) */}
          {children && <div className="pt-4 lg:pt-6 border-t border-gray-200/50">{children}</div>}
        </div>
      )}
    </div>
  );
}
