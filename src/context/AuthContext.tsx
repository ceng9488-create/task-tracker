import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { isDemoMode, setDemoMode } from "../lib/db";
import { DEMO_USER_ID, resetDemoData } from "../lib/demoDb";

interface AuthContextValue {
    session: Session | null;
    loading: boolean;
    isDemo: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<string | null>;
    signUpWithEmail: (email: string, password: string) => Promise<string | null>;
    enterDemo: () => void;
    signOut:() => Promise<void>;
}

// Stands in for a real Supabase session so the rest of the app can stay
// unaware of demo mode.
const DEMO_SESSION = {
    access_token: "demo",
    refresh_token: "demo",
    token_type: "bearer",
    expires_in: 3600,
    user: {
        id: DEMO_USER_ID,
        email: "demo@example.com",
        user_metadata: { full_name: "Demo User" },
        app_metadata: {},
        aud: "demo",
        created_at: new Date().toISOString(),
    },
} as unknown as Session;

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children } : {children: ReactNode }) {
    const [demo, setDemo] = useState(isDemoMode);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (demo) {
            setLoading(false);
            return;
        }
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
            setLoading(false);
        });

        const {data : { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [demo]);

async function signInWithGoogle() {
    const redirectTo = window.location.origin + import.meta.env.BASE_URL;
    console.log('BASE_URL:', import.meta.env.BASE_URL);
    console.log('redirectTo:', redirectTo);
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
    })
}

    async function signInWithEmail(email: string, password: string): Promise<string | null> {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? error.message : null;
    }

    async function signUpWithEmail(email: string, password: string): Promise<string | null> {
        const { error } = await supabase.auth.signUp({ email, password });
        return error ? error.message : null;
    }

    function enterDemo() {
        setDemoMode(true);
        setDemo(true);
    }

    async function signOut() {
        if (demo) {
            setDemoMode(false);
            resetDemoData();
            setDemo(false);
            return;
        }
        await supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{
            session: demo ? DEMO_SESSION : session,
            loading,
            isDemo: demo,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            enterDemo,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if(context === null) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
