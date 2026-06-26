import type {
  Booking,
  GalleryItem,
  SiteSettings,
  Workshop,
  WorkshopSession,
} from "./types";

/**
 * Seed data used to populate the mock DataService the first time it runs.
 * Mirrors the public-site content so the admin feels connected to it.
 */

export const seedWorkshops: Workshop[] = [
  {
    id: "ws_intro_oils",
    title: "Intro to Oil Painting",
    slug: "intro-to-oil-painting",
    description:
      "A gentle, structured introduction to oils — mixing a warm palette, layering, and finishing your first still life over four guided evenings.",
    short_description: "Mix, layer, and finish your first oil still life.",
    price: 280,
    duration_minutes: 120,
    category: "painting",
    skill_level: "beginner",
    image_url: "",
    is_active: true,
    featured: true,
    created_at: "2026-05-01T09:00:00.000Z",
    updated_at: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "ws_wheel_weekend",
    title: "The Pottery Wheel Weekend",
    slug: "pottery-wheel-weekend",
    description:
      "An immersive weekend on the wheel. Throw, trim, and glaze a set of bowls to take home after firing.",
    short_description: "Two days on the wheel — throw, trim, glaze.",
    price: 340,
    duration_minutes: 360,
    category: "ceramics",
    skill_level: "all",
    image_url: "",
    is_active: true,
    featured: true,
    created_at: "2026-05-03T09:00:00.000Z",
    updated_at: "2026-05-03T09:00:00.000Z",
  },
  {
    id: "ws_botanical",
    title: "Botanical Watercolour",
    slug: "botanical-watercolour",
    description:
      "Study light, translucency, and the quiet structure of plants through delicate, layered washes.",
    short_description: "Delicate, layered washes from life.",
    price: 220,
    duration_minutes: 150,
    category: "painting",
    skill_level: "intermediate",
    image_url: "",
    is_active: true,
    featured: false,
    created_at: "2026-05-08T09:00:00.000Z",
    updated_at: "2026-05-08T09:00:00.000Z",
  },
  {
    id: "ws_lino",
    title: "Lino Printmaking Basics",
    slug: "lino-printmaking-basics",
    description:
      "Carve, ink, and press your first reduction lino prints in a relaxed single-day intensive.",
    short_description: "Carve, ink, and press your first lino prints.",
    price: 160,
    duration_minutes: 240,
    category: "printmaking",
    skill_level: "beginner",
    image_url: "",
    is_active: false,
    featured: false,
    created_at: "2026-05-12T09:00:00.000Z",
    updated_at: "2026-05-12T09:00:00.000Z",
  },
];

export const seedSessions: WorkshopSession[] = [
  {
    id: "se_oils_1",
    workshop_id: "ws_intro_oils",
    date: "2026-07-08",
    start_time: "18:00",
    end_time: "20:00",
    capacity: 10,
    available_spots: 3,
  },
  {
    id: "se_oils_2",
    workshop_id: "ws_intro_oils",
    date: "2026-07-15",
    start_time: "18:00",
    end_time: "20:00",
    capacity: 10,
    available_spots: 6,
  },
  {
    id: "se_wheel_1",
    workshop_id: "ws_wheel_weekend",
    date: "2026-07-19",
    start_time: "10:00",
    end_time: "16:00",
    capacity: 8,
    available_spots: 1,
  },
  {
    id: "se_botanical_1",
    workshop_id: "ws_botanical",
    date: "2026-08-07",
    start_time: "09:30",
    end_time: "12:00",
    capacity: 12,
    available_spots: 12,
  },
];

export const seedGallery: GalleryItem[] = [
  {
    id: "gal_1",
    title: "Morning Fields",
    image_url: "",
    category: "painting",
    featured: true,
    display_order: 1,
    created_at: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "gal_2",
    title: "Clay Study No. 4",
    image_url: "",
    category: "ceramics",
    featured: true,
    display_order: 2,
    created_at: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "gal_3",
    title: "Folded Light",
    image_url: "",
    category: "printmaking",
    featured: false,
    display_order: 3,
    created_at: "2026-04-03T09:00:00.000Z",
  },
];

export const seedBookings: Booking[] = [
  {
    id: "bk_1",
    customer_name: "Priya Anand",
    customer_email: "priya@example.com",
    customer_phone: "+1 503 555 0111",
    workshop_id: "ws_intro_oils",
    session_id: "se_oils_1",
    participants: 2,
    status: "confirmed",
    notes: null,
    created_at: "2026-06-10T14:20:00.000Z",
  },
  {
    id: "bk_2",
    customer_name: "Tom Becker",
    customer_email: "tom@example.com",
    customer_phone: "+1 503 555 0122",
    workshop_id: "ws_wheel_weekend",
    session_id: "se_wheel_1",
    participants: 1,
    status: "pending",
    notes: null,
    created_at: "2026-06-18T10:05:00.000Z",
  },
  {
    id: "bk_3",
    customer_name: "Grace Lin",
    customer_email: "grace@example.com",
    customer_phone: "+1 503 555 0133",
    workshop_id: "ws_intro_oils",
    session_id: "se_oils_2",
    participants: 3,
    status: "paid",
    notes: null,
    created_at: "2026-06-20T16:45:00.000Z",
  },
];

export const seedSettings: SiteSettings = {
  hero_title: "Make something beautiful by hand.",
  hero_subtitle:
    "A warm, light-filled studio for small-group classes and immersive workshops.",
  hero_image_url: "",
  whatsapp_number: "+1 503 555 0142",
  email: "hello@theartstudio.com",
  address: "42 Kiln Lane, Portland, OR 97209",
  business_hours: "Tue – Sun · 9am – 6pm",
  instagram_url: "https://instagram.com/theartstudio",
};
