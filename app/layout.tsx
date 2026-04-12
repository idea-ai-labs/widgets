import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import TopNav from "./components/TopNav";

export const metadata = {
  title: "Widget Store",
  description: "App Store style widget system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}