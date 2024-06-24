import { Montserrat } from "next/font/google";
import "@/styles/globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Hermas AI",
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
