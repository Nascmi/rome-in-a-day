import "./globals.css";

export const metadata = {
  title: "Rome Wasn't Built in a Day",
  description: "Build Rome before sunset. Fail. Learn. Return stronger tomorrow."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
