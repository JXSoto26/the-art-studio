/**
 * Central content/data for The Art Studio.
 * Pages and components read from here so copy stays consistent and is easy
 * to swap for a CMS later.
 */

export type ClassCategory = {
  id: string;
  title: string;
  blurb: string;
  detail: string;
};

export type Workshop = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "All levels";
  duration: string;
  price: string;
  schedule: string;
  description: string;
};

export type GalleryPiece = {
  id: string;
  title: string;
  medium: string;
  artist: string;
  tone: string; // tailwind gradient classes used as an image stand-in
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

export const featuredWorkshops: Workshop[] = [
  {
    id: "intro-oils",
    title: "Intro to Oil Painting",
    level: "Beginner",
    duration: "4 weeks · Tue evenings",
    price: "$280",
    schedule: "Starts July 8",
    description:
      "A gentle, structured introduction to oils — mixing a warm palette, layering, and finishing your first still life.",
  },
  {
    id: "wheel-weekend",
    title: "The Pottery Wheel Weekend",
    level: "All levels",
    duration: "2 days · Sat & Sun",
    price: "$340",
    schedule: "July 19–20",
    description:
      "An immersive weekend on the wheel. Throw, trim, and glaze a set of bowls to take home after firing.",
  },
  {
    id: "botanical-watercolour",
    title: "Botanical Watercolour",
    level: "Intermediate",
    duration: "3 weeks · Thu mornings",
    price: "$220",
    schedule: "Starts Aug 7",
    description:
      "Study light, translucency, and the quiet structure of plants through delicate, layered washes.",
  },
];

export const galleryPieces: GalleryPiece[] = [
  {
    id: "g1",
    title: "Morning Fields",
    medium: "Oil on linen",
    artist: "Lena Ortiz",
    tone: "from-olive/80 via-olive/40 to-beige",
  },
  {
    id: "g2",
    title: "Clay Study No. 4",
    medium: "Stoneware",
    artist: "Marcus Bell",
    tone: "from-clay/80 via-clay/40 to-ivory",
  },
  {
    id: "g3",
    title: "Folded Light",
    medium: "Monoprint",
    artist: "Aisha Rahman",
    tone: "from-ink/70 via-clay/30 to-beige",
  },
  {
    id: "g4",
    title: "Quiet Harvest",
    medium: "Watercolour",
    artist: "Lena Ortiz",
    tone: "from-clay/60 via-olive/30 to-ivory",
  },
  {
    id: "g5",
    title: "Vessel in Ochre",
    medium: "Glazed ceramic",
    artist: "Jonah Pike",
    tone: "from-olive/70 via-beige to-clay/40",
  },
  {
    id: "g6",
    title: "Linen & Dust",
    medium: "Natural dye textile",
    artist: "Marcus Bell",
    tone: "from-beige via-clay/40 to-olive/50",
  },
];

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Classes", to: "/classes" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];
