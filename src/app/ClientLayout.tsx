"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show navigation on login page for cleaner UI
  const showNavigation = pathname !== "/login";

  return (
    <>
      {showNavigation && <Navigation />}
      {children}
    </>
  );
}
