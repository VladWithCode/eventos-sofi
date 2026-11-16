import { ImageResponse } from "next/og";

export const alt = "Eventos Sofi — Creamos eventos inolvidables en Durango";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BALLOONS = [
  { x: 792, y: 96, r: 54, color: "#8a9ba5" },
  { x: 872, y: 62, r: 40, color: "#f6f1e8" },
  { x: 940, y: 104, r: 58, color: "#c5d0d6" },
  { x: 1020, y: 86, r: 36, color: "#cfa862" },
  { x: 746, y: 176, r: 44, color: "#ece3d4" },
  { x: 716, y: 262, r: 32, color: "#8a9ba5" },
  { x: 1076, y: 150, r: 46, color: "#f6f1e8" },
  { x: 700, y: 332, r: 24, color: "#cfa862" },
];

/** Link preview card shown when the site is shared on Facebook, WhatsApp or Instagram. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(120deg, #f8f3ea 0%, #f5ead3 100%)",
          color: "#16171a",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 110,
            bottom: 0,
            width: 380,
            height: 500,
            display: "flex",
            borderTopLeftRadius: 190,
            borderTopRightRadius: 190,
            background: "linear-gradient(165deg, #dfe7eb 0%, #b9c7cf 55%, #8a9ba5 100%)",
          }}
        />
        {BALLOONS.map((balloon) => (
          <div
            key={`${balloon.x}-${balloon.y}`}
            style={{
              position: "absolute",
              left: balloon.x - balloon.r,
              top: balloon.y - balloon.r,
              width: balloon.r * 2,
              height: balloon.r * 2,
              display: "flex",
              borderRadius: "50%",
              background: balloon.color,
              boxShadow: "inset -10px -14px 24px rgba(22, 23, 26, 0.16)",
            }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 720 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 7, color: "#85632a", textTransform: "uppercase" }}>
            Eventos Sofi · Durango
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 92, lineHeight: 1, letterSpacing: -3, fontWeight: 700 }}>
            <span>Creamos eventos</span>
            <span style={{ color: "#85632a" }}>inolvidables</span>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 30, lineHeight: 1.35, color: "#3d4045" }}>
            Organización, decoración, banquetes y mobiliario. De principio a fin.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
