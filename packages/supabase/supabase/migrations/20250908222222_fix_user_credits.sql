-- Fix: Assicuriamoci che il trigger funzioni
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ricrea la funzione corretta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Crea profilo utente
    INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Crea crediti iniziali
    INSERT INTO public.user_credits (user_id, balance, total_purchased, total_consumed, total_earned)
    VALUES (NEW.id, 10, 0, 0, 10);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ricrea il trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dai crediti agli utenti già registrati che non li hanno
INSERT INTO public.user_credits (user_id, balance, total_purchased, total_consumed, total_earned)
SELECT 
    id,
    10,
    0,
    0,
    10
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;