export const metadata = {
  title: "Widget Store",
  description: "Collection of useful widgets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f8f9fb" }}>
        {children}
      </body>
    </html>
  );
}
