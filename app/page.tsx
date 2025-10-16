import CTAAndFooter from "./components/CTAandFooter";
import Hero from "./components/Hero";
import KeyFeatures from "./components/KeyFeatures";
import Navbar from "@/components/navbar-04/navbar-04";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen">
        <Hero />
        <KeyFeatures />
        <CTAAndFooter />
      </main>
    </>
  );
}
