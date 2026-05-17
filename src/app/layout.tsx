import './globals.css';

export const metadata = {
  title: 'StoryMaker | Aesthetic Quote Editor',
  description: 'Create premium cinematic quote stories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}