import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { listFaqs } from "@/lib/data/faqs";
import { listGallery } from "@/lib/data/gallery";
import { listServices } from "@/lib/data/services";
import { readSettings } from "@/lib/data/settings";
import { listTestimonials } from "@/lib/data/testimonials";
import type { Faq, GalleryItem, Service, SiteSettings, Testimonial } from "@/lib/types";

/** Cache tags for public content. Admin mutations call `updateTag` with these. */
export const CONTENT_TAGS = {
  settings: "content:settings",
  services: "content:services",
  gallery: "content:gallery",
  testimonials: "content:testimonials",
  faqs: "content:faqs",
} as const;

// Content changes only through the admin, which invalidates the tag, so the
// long "max" lifetime keeps it in the static shell between edits.

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAGS.settings);
  return readSettings();
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAGS.services);
  return listServices({ onlyVisible: true });
}

export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAGS.gallery);
  return listGallery({ onlyVisible: true });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAGS.testimonials);
  return listTestimonials({ onlyVisible: true });
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAGS.faqs);
  return listFaqs({ onlyVisible: true });
}
