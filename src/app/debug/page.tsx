"use client";

import { useAuthContext } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function DebugPage() {
  const { user, session, loading } = useAuthContext();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(
    null
  );

  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      setDebugInfo({
        session,
        user,
        sessionError: error,
        userError,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setDebugInfo({ error: errorMessage });
    }
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      setDebugInfo({ message: "Session cleared" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setDebugInfo({ error: errorMessage });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Auth Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estado del Context */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
              <p>
                <strong>User:</strong> {user ? user.email : "None"}
              </p>
              <p>
                <strong>User ID:</strong> {user?.id || "None"}
              </p>
              <p>
                <strong>Session:</strong> {session ? "Active" : "None"}
              </p>
              <p>
                <strong>Session Token:</strong>{" "}
                {session?.access_token ? "Present" : "None"}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={checkAuth}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Check Auth State
              </button>
              <button
                onClick={clearSession}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Session
              </button>
              <a
                href="/auth/login"
                className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
              >
                Go to Login
              </a>
              <a
                href="/dashboard"
                className="block w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
