import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/", "/login", "/dashboard"],
      },
      {
        userAgent: [
          "facebookexternalhit",
          "Facebot",
          "Twitterbot",
          "WhatsApp",
          "LinkedInBot",
        ],
        allow: ["/r/", "/c/", "/registration/", "/check-in/"],
        disallow: ["/login", "/dashboard"],
      },
    ],
  };
}
