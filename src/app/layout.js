import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Mystery マッチ",
  description: "Drake will happy if he see this",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
