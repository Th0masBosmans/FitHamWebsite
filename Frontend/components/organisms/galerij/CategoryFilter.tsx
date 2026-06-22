"use client";

import { categories, categoryLabels } from "@/data/galleriesData";
import type { GalleryCategory } from "@/types";

type CategoryFilterProps = {
  selected: GalleryCategory;
  onSelect: (category: GalleryCategory) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 label-regular ${
              selected === category
                ? "bg-[var(--color-accent)] text-[var(--color-primary-brand)] scale-105"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
            style={{ fontWeight: "var(--font-weight-bold)" }}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>
    </div>
  );
}
