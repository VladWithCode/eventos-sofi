export type EventTypeSlug =
  | "xv-anos"
  | "boda"
  | "infantil"
  | "cumpleanos"
  | "graduacion"
  | "bautizo"
  | "empresarial"
  | "otro";

export type MediaImage = { url: string; width: number; height: number; blurDataUrl: string; alt: string };

export type SiteSettings = {
  businessName: string;
  tagline: string;
  /** Digits only with country code, e.g. "52" + 10 digits. */
  phone: string;
  /** Digits only with country code. */
  whatsapp: string;
  /** Prefilled chat text. */
  whatsappMessage: string;
  email: string;
  address: string;
  city: string;
  serviceArea: string;
  hours: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  yearsExperience: number;
  /** 0 means unknown; the landing hides it. */
  eventsCompleted: number;
};

export type Service = {
  id: number;
  title: string;
  summary: string;
  description: string;
  features: string[];
  image: MediaImage | null;
  priceFrom: number | null;
  position: number;
  visible: boolean;
};

export type GalleryItem = {
  id: number;
  image: MediaImage;
  eventType: EventTypeSlug;
  caption: string;
  featured: boolean;
  position: number;
  visible: boolean;
};

export type Testimonial = {
  id: number;
  author: string;
  eventType: EventTypeSlug;
  quote: string;
  rating: number;
  position: number;
  visible: boolean;
};

export type Faq = { id: number; question: string; answer: string; position: number; visible: boolean };

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  eventId?: string;
};
