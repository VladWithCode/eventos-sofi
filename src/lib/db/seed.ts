import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Eventos Sofi",
  tagline: "Creamos eventos inolvidables",
  phone: "526181091072",
  whatsapp: "526181715076",
  whatsappMessage: "¡Hola! Me gustaría cotizar un evento con Eventos Sofi.",
  email: "sofieventos@outlook.es",
  address: "Calle Alfonso Corona del Rosal 1004, Col. Santa Fe, C.P. 34240",
  city: "Durango, Dgo.",
  serviceArea: "Durango y alrededores",
  hours: "",
  instagramUrl: "https://www.instagram.com/eventossofi/",
  facebookUrl: "https://www.facebook.com/organizadordeeventossofilove/",
  tiktokUrl: "",
  yearsExperience: 16,
  eventsCompleted: 0,
};

export const SEED_SERVICES: ReadonlyArray<{
  title: string;
  summary: string;
  description: string;
  features: string[];
}> = [
  {
    title: "Organización y diseño de eventos",
    summary: "Planeamos y coordinamos tu evento de principio a fin.",
    description:
      "Te acompañamos desde la primera idea hasta el último detalle del día, para que tú solo te ocupes de disfrutar. Diseñamos un concepto a tu medida y coordinamos a cada proveedor para que todo fluya.",
    features: [
      "Asesoría y diseño del concepto",
      "Planeación de tiempos y presupuesto",
      "Coordinación de proveedores",
      "Coordinación el día del evento",
    ],
  },
  {
    title: "Decoración y globos",
    summary: "Arcos, guirnaldas, flores y sets fotográficos temáticos.",
    description:
      "Transformamos cualquier espacio con decoraciones que reflejan tu estilo y la temática de tu celebración. Cuidamos cada color, textura y detalle para que tus fotos luzcan increíbles.",
    features: [
      "Arcos y guirnaldas de globos",
      "Arreglos florales",
      "Sets fotográficos temáticos",
      "Centros de mesa",
    ],
  },
  {
    title: "Banquetes y catering",
    summary: "Coffee break, bocadillos, taquizas y carritos de snacks.",
    description:
      "Ofrecemos opciones de alimentos para cada tipo de evento, desde algo ligero hasta una comida completa. Te ayudamos a elegir el menú ideal según tus invitados y el horario de tu celebración.",
    features: ["Coffee break", "Bocadillos y canapés", "Taquizas", "Carritos de hot dog y de snacks"],
  },
  {
    title: "Renta de mobiliario y loza",
    summary: "Mesas, sillas, salas lounge, barras, loza y mantelería.",
    description:
      "Contamos con mobiliario y loza para equipar tu evento con estilo y comodidad. Te asesoramos para elegir las piezas que mejor combinan con tu decoración y el espacio disponible.",
    features: [
      "Mesas y sillas",
      "Salas lounge y barras de bebidas",
      "Loza y cristalería",
      "Mantelería",
    ],
  },
  {
    title: "Telas y techos decorativos",
    summary: "Venta y renta de telas, drapeados y techos.",
    description:
      "Las telas cambian por completo la atmósfera de un salón o jardín. Te asesoramos sobre los metros y el tipo de tela que necesitas, ya sea para renta o para compra.",
    features: ["Venta de telas", "Renta de telas", "Drapeados y techos decorativos", "Asesoría de metros"],
  },
  {
    title: "Efectos especiales",
    summary: "Confeti, chispas frías, robot LED y letras luminosas.",
    description:
      "Agrega momentos sorpresa que tus invitados recordarán, como la entrada, el primer baile o el brindis. Te recomendamos los efectos que mejor se adaptan a tu evento y al lugar.",
    features: ["Lluvia de confeti", "Chispas frías", "Robot LED", "Letras y sillas LED"],
  },
];

export const SEED_FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "¿Con cuánta anticipación debo reservar?",
    answer:
      "Depende del tipo de evento y de la temporada. Te recomendamos contactarnos en cuanto tengas la fecha para confirmar disponibilidad; con gusto revisamos también fechas próximas.",
  },
  {
    question: "¿Cómo se aparta la fecha y cómo son los pagos?",
    answer:
      "Al confirmar tu cotización te explicamos el anticipo para apartar la fecha y las formas de pago disponibles. Todo queda por escrito antes de tu evento.",
  },
  {
    question: "¿En qué zona dan servicio?",
    answer:
      "Trabajamos en Durango, Dgo. y sus alrededores. Si tu evento es en otra localidad, escríbenos por WhatsApp y revisamos la posibilidad de acompañarte.",
  },
  {
    question: "¿Qué incluye el servicio?",
    answer:
      "Cada paquete se arma según lo que necesitas: decoración, mobiliario, alimentos, efectos especiales o la coordinación completa. En tu cotización verás el detalle de lo que incluye.",
  },
  {
    question: "¿Puedo personalizar la decoración y la temática?",
    answer:
      "Sí. Diseñamos cada evento a partir de tus ideas, colores y estilo. Puedes compartirnos fotos de referencia y te proponemos opciones que se ajusten a tu presupuesto.",
  },
  {
    question: "¿Qué pasa si necesito cambiar la fecha?",
    answer:
      "Avísanos lo antes posible y revisamos juntos la disponibilidad. Las condiciones para cambios de fecha se acuerdan al momento de confirmar tu evento.",
  },
];
