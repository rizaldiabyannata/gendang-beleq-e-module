import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "./sw-register";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "E-Modul Gelombang Bunyi · Gendang Beleq",
  description:
    "E-modul Fisika Fase F tentang gelombang bunyi, dibangun di atas kearifan lokal Gendang Beleq Sasak.",
  manifest: "./manifest.webmanifest",
  applicationName: "E-Modul Gelombang Bunyi",
};

export const viewport: Viewport = {
  themeColor: "#15122f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${instrumentSerif.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
