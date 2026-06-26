/**
 * Static marketing content for The Art Studio.
 *
 * This file holds only copy that has no admin/CMS model yet — the class
 * disciplines blurb and the navigation links. Dynamic content (workshops,
 * gallery, site settings) now comes from `dataService` via the
 * PublicDataProvider, so the admin CMS is the source of truth for it.
 */

export type ClassCategory = {
  id: string;
  title: string;
  blurb: string;
  detail: string;
};

export const classCategories: ClassCategory[] = [
  {
    id: "painting",
    title: "Painting & Drawing",
    blurb: "Oils, watercolour & charcoal",
    detail:
      "From first brushstroke to finished canvas — colour theory, composition, and confident mark-making.",
  },
  {
    id: "ceramics",
    title: "Ceramics & Pottery",
    blurb: "Wheel throwing & hand-building",
    detail:
      "Center clay, pull walls, and glaze your own collection in our light-filled ceramics studio.",
  },
  {
    id: "printmaking",
    title: "Printmaking",
    blurb: "Lino, screen & monoprint",
    detail:
      "Carve, ink, and press. A tactile craft for makers who love pattern, layers, and repetition.",
  },
  {
    id: "textiles",
    title: "Textiles & Fibre",
    blurb: "Weaving & natural dye",
    detail:
      "Work with wool, linen, and plant-based pigments to create soft, sculptural pieces.",
  },
];

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Classes", to: "/classes" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];
