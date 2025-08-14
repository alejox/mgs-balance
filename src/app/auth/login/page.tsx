"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuthContext();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Iniciando login para:", email);

      // Usar directamente Supabase para el login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Resultado del login:", { data, error });

      if (error) {
        throw error;
      }

      if (!data || !data.user) {
        throw new Error("No se pudo obtener información del usuario");
      }

      console.log("Login exitoso:", data.user.email);
      console.log("Session data:", data.session);

      // Redirigir inmediatamente después del login exitoso
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      console.error("Error en login:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu dashboard de transacciones
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
