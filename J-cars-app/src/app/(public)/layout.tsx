import { AlertBanner } from "@/components/layout/alert-banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AlertBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
