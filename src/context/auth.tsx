import { Auth } from "@supabase/auth-ui-react";
import { FC, PropsWithChildren, createContext, useCallback } from "react";
import { Session, createClient } from "@supabase/supabase-js";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";

const SUPABASE_PROJECT_ID = "pipzbzirwjjdvppibakr";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcHpiemlyd2pqZHZwcGliYWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODgyMTk1NTUsImV4cCI6MjAwMzc5NTU1NX0.1WOcZ2xmNB34vHsICDGkux5-MogACtrWK1t6MttbUfY";

const supabase = createClient(
  `https://${SUPABASE_PROJECT_ID}.supabase.co`,
  SUPABASE_ANON_KEY
);

const AuthContext = createContext({
  session: null as Session | null,
  logout: () => {
    return;
  },
});

export type AuthProviderProps = PropsWithChildren<{
  onError?: (error: Error, message: string) => void;
  onSuccess?: (message: string) => void;
}>;

export const AuthProvider: FC<AuthProviderProps> = ({
  onError,
  onSuccess,
  ...props
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        onSuccess?.("Signed in");
      })
      .catch((error) => {
        onError?.(error, "Failed to log in");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [onError, onSuccess]);

  const logout = useCallback(() => {
    supabase.auth
      .signOut()
      .then(() => {
        console.log("TODO toast Signed out");
        onSuccess?.("Signed out");
      })
      .catch((error) => {
        console.error("TODO toast error", error);
        onError?.(error, "Failed to log out");
      });
  }, [onError, onSuccess]);

  return (
    <AuthContext.Provider value={{ session, logout }}>
      {session ? (
        props.children
      ) : (
        <Auth
          providers={["google"]}
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          redirectTo={window.location.origin}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
