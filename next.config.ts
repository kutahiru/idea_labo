import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// フォント最適化の警告を完全に抑制
if (typeof window === 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('Failed to find font override values') ||
      message.includes('Skipping generating a fallback font') ||
      message.includes('WDXL Lubrifont JP N')
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('Failed to find font override values') ||
      message.includes('Skipping generating a fallback font') ||
      message.includes('WDXL Lubrifont JP N')
    ) {
      return;
    }
    originalError(...args);
  };
}

export default nextConfig;
