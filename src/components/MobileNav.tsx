import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { navLinks } from "./navLinks";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-xl font-bold text-indigo-600">FinTrack</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
