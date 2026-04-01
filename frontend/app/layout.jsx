import "./globals.css";

export const metadata = {
  title: "KGRN Amplified — Proposal Portal",
  description: "KGRN Proposal Management Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
