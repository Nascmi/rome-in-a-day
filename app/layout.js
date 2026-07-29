import "./globals.css";

export const metadata = {
  title: "Rome Wasn't Built in a Day",
  description: "Build Rome before sunset. Fail. Learn. Return stronger tomorrow.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Build Rome"
  },
  icons: {
    icon: "/icons/rome-icon.svg",
    apple: "/icons/rome-icon.svg"
  }
};

export const viewport = {
  themeColor: "#8f2d28"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
