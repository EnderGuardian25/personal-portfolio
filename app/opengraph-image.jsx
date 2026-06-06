import { ImageResponse } from "next/og";

export const alt = "Damian De Cruz — Creative Technologist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F6F6F1",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          justifyContent: "space-between",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.22em", color: "#16315A", textTransform: "uppercase", opacity: 0.7 }}>
            DDC / Portfolio '26
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.18em", color: "#16315A", textTransform: "uppercase", textAlign: "right", opacity: 0.7 }}>
            <div>N 6.9271° / E 79.8612°</div>
            <div style={{ marginTop: 4, opacity: 0.6 }}>Colombo · Sri Lanka</div>
          </div>
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 0.83 }}>
          <div
            style={{
              fontSize: 178,
              fontWeight: 700,
              color: "#0B1F3A",
              textTransform: "uppercase",
              letterSpacing: "-0.055em",
              lineHeight: 0.88,
            }}
          >
            DAMIAN
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 178,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.055em",
              lineHeight: 0.88,
            }}
          >
            <span style={{ color: "#2563EB", fontStyle: "italic" }}>DE&nbsp;</span>
            <span style={{ color: "#0B1F3A" }}>CRUZ.</span>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontStyle: "italic", fontSize: 20, color: "#16315A", opacity: 0.75 }}>
            Creative Technologist
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "#16315A",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            BSc (Hons) Computer Science · IIT Colombo
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
