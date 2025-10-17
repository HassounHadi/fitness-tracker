export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/40 via-background to-secondary/50 px-6 w-full">
      {children}
    </section>
  );
}
