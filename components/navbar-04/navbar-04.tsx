import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const Navbar = () => {
  return (
    <nav className="fixed top-6 inset-x-4 h-16 bg-background border dark:border-slate-700/70 mx-auto max-w-(--breakpoint-xl) rounded-full z-10 shadow-lg">
      <div className="h-full flex items-center justify-between mx-auto px-6 md:px-10">
        <Logo />

        {/* Desktop Menu */}
        {/* <NavMenu className="hidden md:block" /> */}

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button>Get Started</Button>

          {/* Mobile Menu */}
          {/* <div className="md:hidden">
              <NavigationSheet />
            </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
