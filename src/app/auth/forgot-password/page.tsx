"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // Aquí irá la lógica de recuperación de contraseña
      console.log("Forgot password data:", data);
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error en recuperación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className=" flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="mx-auto w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Email enviado
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Hemos enviado un enlace de recuperación a tu email. Revisa tu
              bandeja de entrada.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors text-sm"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Recuperar contraseña
            </h2>
            <p className="text-xs text-gray-600">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm text-black"
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              ) : (
                <>
                  Enviar enlace de recuperación
                  <ArrowRight className="ml-2 h-3 w-3" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium transition-colors text-sm"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
