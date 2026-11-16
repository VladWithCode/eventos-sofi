/** In-page sections reachable from the header and footer. */
export function navLinks({ hasGallery }: { hasGallery: boolean }) {
  return [
    { href: "#servicios", label: "Servicios" },
    ...(hasGallery ? [{ href: "#galeria", label: "Galería" }] : []),
    { href: "#proceso", label: "Cómo trabajamos" },
    { href: "#preguntas", label: "Preguntas" },
    { href: "#contacto", label: "Contacto" },
  ];
}
