import type { EventTypeSlug } from "@/lib/types";

/**
 * Photos from the business's own Facebook and Instagram pages, already
 * processed like admin uploads. The files live in /seed/media and are copied
 * into the uploads folder the first time the database is created.
 */
export type SeedImage = { file: string; width: number; height: number; blur: string; alt: string };

export const SEED_GALLERY: ReadonlyArray<SeedImage & { eventType: EventTypeSlug; caption: string; featured: boolean }> = [
  {
    "file": "dc98f0e6ceb6fa2089f20a89c575a9c3.webp",
    "width": 1200,
    "height": 1600,
    "blur": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAQCdASoMABAAAsBMJbACdAYvD29LXVAA+LMOseMWSX2kOpm3pp07lubYD0EZNIh/aJUM3Vw3G0nQMeywsftqjlxuHtMqc9k27EnLH6cGr/y4DMceV6FzA/kays86GrRQAAAA",
    "alt": "Fiesta infantil con techo de flores rosas y mesas decoradas en lila",
    "eventType": "infantil",
    "caption": "Fiesta infantil temática",
    "featured": true
  },
  {
    "file": "72abecb7ad2b16effd70b4ba26a515a1.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACQAQCdASoJABAAAsBMJbACdADYXAAA/rN1H3Ez3WQ1lfaN31xhD3Nqz4EZ8GJKxbDqXIGjJnZjPxdxa5nRJjItxECD/ncPKjvlV/Ifz2CjdGYA",
    "alt": "Arco floral rosa iluminado para XV años",
    "eventType": "xv-anos",
    "caption": "Arco floral para XV años",
    "featured": true
  },
  {
    "file": "f5cf6ab6102cecc0ed0ffc2c113f61da.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAwAgCdASoJABAAAsBMJYgCdAYtVmvxyH/1hAD+0PdWi/KbNn0ZJcxpEXv4mDOO/0hQQ5PGHWPlez6U6csEHHXzXna1fdCJhqQt2Ahn+imiy1OIOzNsBl/+WAA=",
    "alt": "Muro verde con letrero de neón Mis XV Años y arreglos florales",
    "eventType": "xv-anos",
    "caption": "Set para XV años",
    "featured": false
  },
  {
    "file": "817f365a0a8f9a8e9bc9490293d6454a.webp",
    "width": 1024,
    "height": 1536,
    "blur": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoLABAAAsBMJbACdAEOxpQIIAAA/owpXv/WvY9jGjJk1FXeOJxteOG3IzmmXUVLA9pZ42IXQMg5s1T2IzEvzfJGAAA=",
    "alt": "Copa de cristal azul labrada",
    "eventType": "otro",
    "caption": "Cristalería en renta",
    "featured": false
  },
  {
    "file": "9a89efd08ba0e71ed2d76ce58e3c9e56.webp",
    "width": 1599,
    "height": 1536,
    "blur": "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADwAQCdASoQAA8AAsBMJQBOgMX6wJP1bAAA8p/6hQgg7DPiLFu4nHB6s2dTmeC20iWVTH6XM46x/rGsfCSbu1qLJZ1pPFlDzgOfBOvmM9KifBZG49AwnIwNpwWFxpQd57LANzcdTBcv+DcycQq+EaRyuRfQAA==",
    "alt": "Caja de sobres blanca con detalles dorados para boda",
    "eventType": "boda",
    "caption": "Detalles para boda",
    "featured": false
  },
  {
    "file": "b22c4be794a096f2c440b10a08350d99.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoJABAAAsBMJZQCw8HTP8omzO7rMAD+5GP8WxFR6DeKm89q2cn0blsJDWtwhHSmbyGsImb1M7PRKd9/RTIV0hTaZjuW5lmsx0b5BP7zORRcn+CdgDTIL0AA",
    "alt": "Auditorio decorado con telas en el techo y sillas para graduación",
    "eventType": "graduacion",
    "caption": "Montaje de graduación",
    "featured": false
  },
  {
    "file": "7968d56ad8178c20abf05d50688c7eb2.webp",
    "width": 2048,
    "height": 1366,
    "blur": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAsAAsBMJYgCdADPz7UEAAD92SHTZVZ7e5I7k25UQ2iuH1nDjjRzllH2xhNWBd4X6IBgQAA=",
    "alt": "Servilleta rosa satinada con aro dorado",
    "eventType": "otro",
    "caption": "Mantelería en renta",
    "featured": false
  },
  {
    "file": "706383061c16face781f9d630723a620.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAQCdASoJABAAAsBMJbACdADZs39nU4AA90U+5wpUgKp2ysBCq3VX+R4YpDRRGZCzbihac5Lrvnqn790b+xG4t8QAV1Svybt9Xk9vwH+tNBWP1pobV72SxTgAAA==",
    "alt": "Centro de mesa alto con flores rosas en un salón iluminado",
    "eventType": "otro",
    "caption": "Centros de mesa",
    "featured": false
  },
  {
    "file": "dbaf580d3584084d7073c4182f50c0b6.webp",
    "width": 1536,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAADwAQCdASoNABAAAsBMJbACdAC3syqyUAAA+yNV/DhCd9UFOiYn+8XbWpZtwXWw6zljhd12STMB+/z6/a3V1jF/x669ciKvryBf9EfjyLt6uDLjfLPcw9newSMjUofdioKbuvdbwvs7Y6xeamoAAA==",
    "alt": "Altar decorado con flores rosas y blancas",
    "eventType": "otro",
    "caption": "Altar floral",
    "featured": false
  },
  {
    "file": "a7f81537d0d3ca3678f6099e5786b920.webp",
    "width": 1024,
    "height": 1536,
    "blur": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQAgCdASoLABAAAsBMJbACdAELX8x5B+AgAP7zdbqYuxZ0NTFnLS5uoPG5h+ub7sXJ4FLkNJPPMLHdPZv27qhrbo2Bfjd7IiIT1ZygAAA=",
    "alt": "Copa de cristal ámbar",
    "eventType": "otro",
    "caption": "Cristalería en renta",
    "featured": false
  },
  {
    "file": "15d5c6db52a29a624fb501251ac43eff.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoJABAAAsBMJYwCdAEOaTMi6S6AAP75KWgaNNXMDRpxrD9T+dJUTdujBp1ubqS8syRlEVDT7clcxX5s+a4rqcT9d3rAAA==",
    "alt": "Lluvia de confeti plateado durante un vals de XV años",
    "eventType": "xv-anos",
    "caption": "Lluvia de confeti",
    "featured": false
  },
  {
    "file": "fd16596e22fae9a6a5c98ee8d06490e1.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAQCdASoJABAAAsBMJQAAXU69a6CyCAD2sZ681kLoTXth53wA52L2nkpvh9gUW9pL/4bKqLdgg8U700YSg3+VVw1S9eYbBtw36nn7e/+gAA==",
    "alt": "Mesa dorada con caja de sobres y letra iluminada",
    "eventType": "otro",
    "caption": "Mesa de recuerdos",
    "featured": false
  },
  {
    "file": "b9a010122487faba544bed2ec1878cd5.webp",
    "width": 720,
    "height": 960,
    "blur": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwAgCdASoMABAAAsBMJbACdAYvhax+zBW8QADduQ3io3SzHcWNOmhu4gVKVhFJXjRcvo/wTFQ8qEMKC2/MS3YQVOWp3bFMfSkWx63QDa/uRroFbFHYv1NbkCBzDLiVEAA=",
    "alt": "Mesas decoradas en lila bajo una carpa con telas rosas",
    "eventType": "infantil",
    "caption": "Fiesta infantil",
    "featured": false
  },
  {
    "file": "b6b51e0fda8a962d5b26a56f7f5870c8.webp",
    "width": 1024,
    "height": 1536,
    "blur": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoLABAAAsBMJQBOgCHgMqaWLIAA/vN4+TQc/tmwZendCecAt73xLN1p1fl70ssye6OfyfAA",
    "alt": "Copa de cristal rosa labrada",
    "eventType": "otro",
    "caption": "Cristalería en renta",
    "featured": false
  },
  {
    "file": "0cae6742d3e56917a10c6ad5da81be70.webp",
    "width": 1536,
    "height": 1024,
    "blur": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAsAAsBMJZgCdAEKmMAj6AAA/RHa5rr2oNz0GyhviVPg3E5cJXPyauwwmCdfF3YjjFAAAAA=",
    "alt": "Tenedor dorado martillado",
    "eventType": "otro",
    "caption": "Cubertería en renta",
    "featured": false
  }
];

/** One image per entry of SEED_SERVICES, in the same order. */
export const SEED_SERVICE_IMAGES: ReadonlyArray<SeedImage> = [
  {
    "file": "e96a32c90ea3a4074de53564714fcc52.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAwAgCdASoJABAAAsBMJYgCdAYtVmvxyH/1hAD+0PdWi/KbNn0ZJcxpEXv4mDOO/0hQQ5PGHWPlez6U6csEHHXzXna1fdCJhqQt2Ahn+imiy1OIOzNsBl/+WAA=",
    "alt": "Set decorado para XV años con muro verde y flores"
  },
  {
    "file": "aef7731848fdcdcb2d0151f2430f6d05.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACQAQCdASoJABAAAsBMJbACdADYXAAA/rN1H3Ez3WQ1lfaN31xhD3Nqz4EZ8GJKxbDqXIGjJnZjPxdxa5nRJjItxECD/ncPKjvlV/Ifz2CjdGYA",
    "alt": "Arco floral rosa iluminado"
  },
  {
    "file": "fe19b4c3c6a22dff8368d0bc4e90caf5.webp",
    "width": 2048,
    "height": 1366,
    "blur": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAsAAsBMJYgCdADPz7UEAAD92SHTZVZ7e5I7k25UQ2iuH1nDjjRzllH2xhNWBd4X6IBgQAA=",
    "alt": "Servilleta satinada con aro dorado lista para el montaje de mesas"
  },
  {
    "file": "686aa359773ff14fca86e3bbf32cf0d4.webp",
    "width": 1024,
    "height": 1536,
    "blur": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoLABAAAsBMJbACdAEOxpQIIAAA/owpXv/WvY9jGjJk1FXeOJxteOG3IzmmXUVLA9pZ42IXQMg5s1T2IzEvzfJGAAA=",
    "alt": "Copa de cristal azul labrada de nuestro catálogo de renta"
  },
  {
    "file": "21c3fe93a8316245cebc59e69ed51f49.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoJABAAAsBMJZQCw8HTP8omzO7rMAD+5GP8WxFR6DeKm89q2cn0blsJDWtwhHSmbyGsImb1M7PRKd9/RTIV0hTaZjuW5lmsx0b5BP7zORRcn+CdgDTIL0AA",
    "alt": "Techo decorado con telas en un auditorio"
  },
  {
    "file": "9128e407712dacbcd6555e964de78d9b.webp",
    "width": 1080,
    "height": 1920,
    "blur": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoJABAAAsBMJYwCdAEOaTMi6S6AAP75KWgaNNXMDRpxrD9T+dJUTdujBp1ubqS8syRlEVDT7clcxX5s+a4rqcT9d3rAAA==",
    "alt": "Lluvia de confeti plateado en una pista de baile"
  }
];
