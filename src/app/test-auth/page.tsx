"use client";

import { useAuthContext } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function TestAuthPage() {
  const { user, session, loading } = useAuthContext();
  const [sessionInfo, setSessionInfo] = useState<Record<
    string,
    unknown
  > | null>(null);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Session check:", { session, error });
      setSessionInfo({ session, error });
    } catch (error) {
      console.error("Error checking session:", error);
      setSessionInfo({ error });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Auth Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth State:</h2>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>User: {user ? user.email : "None"}</p>
          <p>User ID: {user?.id || "None"}</p>
          <p>Session: {session ? "Active" : "None"}</p>
          <p>Session Token: {session?.access_token ? "Present" : "None"}</p>
        </div>

        <div>
          <button
            onClick={checkSession}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Check Session
          </button>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>

        {sessionInfo && (
          <div>
            <h3 className="text-lg font-semibold">Session Info:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <a
            href="/auth/login"
            className="bg-green-500 text-white px-4 py-2 rounded inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}
