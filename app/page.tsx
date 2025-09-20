import Header from "./components/Header";
import Footer from "./components/Footer";
import Feed from "./components/Feed";
import DebugPanel from "./components/debug/DebugPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-foreground flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Feed />
      </main>

      <Footer />

      {/* 개발 중 디버깅용 패널 */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </div>
  );
}
