import "./globals.css";

export const metadata = {
  title: "Mauksh AI — Personal Numerology Intelligence",
  description: "Personalized numerology guidance powered by Mauksh AI."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}