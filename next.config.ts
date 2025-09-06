import { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' 
    https://*.googleapis.com 
    https://*.gstatic.com 
    https://*.google.com
    https://*.googletagmanager.com
    https://cdnjs.cloudflare.com
    https://${supabaseUrl}
    ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline' 
    https://*.googleapis.com 
    https://fonts.googleapis.com
    https://cdnjs.cloudflare.com;
  font-src 'self' data: 
    https://fonts.gstatic.com 
    https://cdnjs.cloudflare.com;
  img-src 'self' data: blob: 
    https://*.googleusercontent.com 
    https://lh3.googleusercontent.com
    https://storage.googleapis.com
    https://${supabaseUrl};
  media-src 'self' 
    https://${supabaseUrl};
  connect-src 'self' 
    https://*.google.com 
    https://*.googleapis.com
    https://${supabaseUrl}
    wss://${supabaseUrl}
    ${process.env.NODE_ENV === "development" ? "http://localhost:*" : ""};
  frame-src 'self' 
    https://*.google.com
    https://${supabaseUrl};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${process.env.NODE_ENV === "production" ? "upgrade-insecure-requests;" : ""}
`;

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on", // Supposed to help with slow connections
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY", // Clickjacking
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff", // MIME type sniffing
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block", // Legacy XSS protection for older browsers
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()", // Restricting browser features
  },
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      ...(supabaseUrl
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseUrl,
              port: "",
              pathname: "/storage/v1/object/public/course-images/**", // Specific to course images only
            },
            {
              protocol: "https" as const,
              hostname: supabaseUrl,
              port: "",
              pathname: "/storage/v1/object/public/logo-images/**", // Specific to logo images only
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "lh3.googleusercontent.com", // Google profile images only
        port: "",
        pathname: "**",
      },
    ],
    // Optimized sizes for actual course card display (378px)
    deviceSizes: [384, 640, 768, 1024], // Added 384px to match actual course card display
    imageSizes: [128, 256, 384], // Removed unnecessary small sizes, focused on card previews
    formats: ["image/webp", "image/avif"], // Keep format optimization for non-Supabase images
    minimumCacheTTL: 2678400, // 31 days cache (Vercel recommendation for static content)
    dangerouslyAllowSVG: true, // Allow SVG images for logos
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // Ensure Prisma client works in serverless environment
  serverExternalPackages: ["@prisma/client", "bcrypt"],

  // Security headers configuration
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // API routes - not cached
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "X-API-Version",
            value: "1.0",
          },
        ],
      },
      {
        // Course pages - short cache with revalidation for fresh data
        source: "/courses/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=60", // 5 min cache, revalidate after 1 min
          },
        ],
      },
      {
        // Advocate/Admin pages - no cache for real-time updates
        source: "/advocate/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Admin pages - no cache for real-time updates
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Dashboard pages - no cache for real-time updates in development
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: process.env.NODE_ENV === "development" 
              ? "private, no-cache, no-store, must-revalidate" 
              : "private, max-age=60, must-revalidate", // 1 minute cache in production
          },
          ...(process.env.NODE_ENV === "development" ? [{
            key: "Pragma",
            value: "no-cache",
          }, {
            key: "Expires",
            value: "0",
          }] : []),
        ],
      },
      {
        // Static assets (JS/CSS bundles) - cache but with revalidation
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Images - moderate caching with revalidation
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200", // 1 day cache, revalidate after 12 hours
          },
        ],
      },
      {
        // Fonts - aggressive caching
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals.push({
        "@prisma/client": "@prisma/client",
      });
    }

    if (!dev) {
      // Optimize bundle splitting for low-bandwidth users
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: "framework",
              chunks: "all",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: any) {
                return (
                  module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier())
                );
              },
              name(module: any) {
                const hash = require("crypto")
                  .createHash("sha1")
                  .update(module.identifier())
                  .digest("hex");
                return hash.substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module: any, chunks: any[]) {
                return (
                  require("crypto")
                    .createHash("sha1")
                    .update(chunks.reduce((acc, chunk) => acc + chunk.name, ""))
                    .digest("hex") + "_shared"
                );
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Environment variables validation (compile-time)
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : ""),
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - was causing critters dependency issues
  },

  // Modern JavaScript configuration
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;