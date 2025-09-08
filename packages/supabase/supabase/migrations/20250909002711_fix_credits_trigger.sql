-- Rimuovi il vecchio trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crea un nuovo trigger che funziona sicuramente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserisci profilo
    INSERT INTO public.user_profiles (id, username, full_name)
    VALUES (
        NEW.id,
        split_part(NEW.email, '@', 1),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Inserisci crediti
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 10)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ricrea il trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();