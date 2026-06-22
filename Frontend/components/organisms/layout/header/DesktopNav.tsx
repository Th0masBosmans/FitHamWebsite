import Link from "next/link";
import { navLinks } from "./navLinks";

/** Centered desktop navigation inside the header's blue segment (≥1024px). */
export function DesktopNav({ activePath }: { activePath: string }) {
  return (
    <nav className="hidden lg:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-[65%]">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`px-3 py-1.5 label-regular font-bold uppercase tracking-tight transition-all rounded whitespace-nowrap ${
            activePath === link.path
              ? "text-[var(--color-accent)] bg-white/10"
              : "text-white hover:text-[var(--color-accent)] hover:bg-white/10"
          }`}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/membership"
        className="px-3 py-1.5 bg-[var(--color-primary-brand)] text-white label-small font-black uppercase tracking-wide rounded hover:bg-[var(--color-primary-brand-darker)] transition-all whitespace-nowrap shadow-sm hover:shadow-md"
      >
        Lid Worden
      </Link>
    </nav>
  );
}
