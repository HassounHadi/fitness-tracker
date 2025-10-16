"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-background border dark:border-slate-700/70 mx-auto max-w-(--breakpoint-xl) rounded-full z-20 shadow-lg">
      <div className="h-full flex items-center justify-between mx-auto px-6 md:px-10">
        <Logo />

        {/* Desktop Menu - Show only when logged in */}
        {session && <NavMenu className="hidden md:block" />}

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            // Loading state
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            // User is logged in
            <>
              <Button variant="secondary" onClick={() => signOut()}>
                Sign Out
              </Button>
              {/* Mobile Menu - Show only when logged in */}
              <div className="md:hidden">
                <NavigationSheet />
              </div>
            </>
          ) : (
            // User is not logged in
            <>
              <Link href="/login">
                <Button variant="secondary" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
