export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {children}
    </div>
  );
}
