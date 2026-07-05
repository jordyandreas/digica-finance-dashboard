import { ImageResponse } from "next/og";
import { getProgramRegistrationShareMetadata } from "@/services/program-share-metadata.service";

export const runtime = "edge";

export const alt = "Digica Academy Program Registration";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ identifier: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { identifier } = await params;
  const share = await getProgramRegistrationShareMetadata(identifier);

  const title = share?.programName ?? "Registrasi Program";
  const dateRange = share?.dateRange ?? "Tanggal akan diumumkan";
  const timeRange = share?.timeRange ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #e3d5ff 0%, #e4efff 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              color: "#620a79",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Digica Academy
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#2e0260",
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 28,
              color: "#5d4f8f",
            }}
          >
            <span>{dateRange}</span>
            {timeRange ? <span>{timeRange}</span> : null}
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 24px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.8)",
              color: "#2e0260",
              fontSize: 22,
              fontWeight: 600,
              border: "2px solid #c1c8fa",
            }}
          >
            Registrasi Program
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
