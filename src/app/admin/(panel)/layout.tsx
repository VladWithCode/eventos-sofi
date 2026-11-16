import Link from "next/link";
import { Suspense } from "react";
import { Account, NewBookingsBadge, UnreadMessagesBadge, Wordmark } from "@/components/admin/account";
import { MobileTabBar, MobileTabBarList, SidebarNav, SidebarNavList, type NavBadges } from "@/components/admin/nav";

// The chrome is static; only the session-dependent pieces stream in. Each page
// performs its own requireAdmin() check.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const badges: NavBadges = {
    reservas: (
      <Suspense fallback={null}>
        <NewBookingsBadge />
      </Suspense>
    ),
    mensajes: (
      <Suspense fallback={null}>
        <UnreadMessagesBadge />
      </Suspense>
    ),
  };
  const account = (
    <Suspense fallback={<div className="h-24" />}>
      <Account />
    </Suspense>
  );

  return (
    <div className="min-h-dvh bg-paper lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col gap-8 border-r border-line bg-surface px-4 py-8 lg:flex">
        <Link href="/admin" className="rounded-lg px-4">
          <Wordmark />
        </Link>
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<SidebarNavList badges={badges} pathname="" />}>
            <SidebarNav badges={badges} />
          </Suspense>
        </div>
        {account}
      </aside>

      <header className="glass sticky top-0 z-30 rounded-none border-x-0 border-t-0 px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center">
          <Link href="/admin" className="rounded-lg">
            <Wordmark />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[72rem] px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:px-8 lg:pt-10 lg:pb-16">
        {children}
      </main>

      <Suspense fallback={<MobileTabBarList badges={badges} more={account} pathname="" />}>
        <MobileTabBar badges={badges} more={account} />
      </Suspense>
    </div>
  );
}
