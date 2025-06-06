import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingShapesBackground from "@/components/FloatingShapesBackground";

export const metadata = {
  title: "Tiffin Hub",
  description: "A platform for delicious tiffin services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative ">
        <FloatingShapesBackground />
        <Header />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
