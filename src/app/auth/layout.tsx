import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Registro - Balance MGS",
  description: "Crea tu cuenta en Balance MGS",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${geist.className} min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-md ">
        <div className="bg-white rounded-2xl  shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Balance MGS
            </h1>
            <p className="text-gray-600">
              Gestiona tus finanzas de manera inteligente
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
