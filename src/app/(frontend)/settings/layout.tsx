import type { Metadata } from 'next';

// Admin login surface — keep it out of all search indexes.
export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false, nocache: true },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
