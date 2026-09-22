import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NotFoundContent } from "@/components/layout/not-found-content";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
