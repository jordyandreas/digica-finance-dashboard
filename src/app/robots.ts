import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/r/", "/c/", "/registration/", "/check-in/", "/logo/"],
        disallow: ["/dashboard/", "/programs/", "/api/"],
      },
      {
        userAgent: [
          "facebookexternalhit",
          "Facebot",
          "Twitterbot",
          "WhatsApp",
          "LinkedInBot",
        ],
        allow: ["/r/", "/c/", "/registration/", "/check-in/", "/logo/"],
      },
    ],
  };
}
