import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut:() => Promise<void>;

}

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children } : {children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
            setLoading(false);
        });

        const {data : { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function signInWithGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        })
    }

    async function signOut() {
        await supabase.auth.signOut();
        
    }

    return (
        <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if(context === null) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
