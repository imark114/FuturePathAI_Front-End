'use client';

/**
 * ClientWrapper — renders children only on the client.
 * This eliminates all hydration mismatches caused by browser extensions
 * (e.g., Bitdefender, Grammarly) that inject attributes like `bis_skin_checked`
 * into the DOM before React can hydrate.
 */
import { useEffect, useState } from 'react';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) {
    // Render a skeleton placeholder that matches the background so
    // there's no flash of unstyled content
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e' }} suppressHydrationWarning />
    );
  }
  return <>{children}</>;
}
