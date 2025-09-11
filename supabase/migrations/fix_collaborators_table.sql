-- Aggiungi colonna per email invito se non esiste
ALTER TABLE tournament_collaborators 
ADD COLUMN IF NOT EXISTS invited_email VARCHAR(255);

-- Rendi user_id nullable
ALTER TABLE tournament_collaborators 
ALTER COLUMN user_id DROP NOT NULL;

-- Aggiungi indice per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_collaborators_email 
ON tournament_collaborators(invited_email);

-- Funzione per collegare inviti quando un utente si registra
CREATE OR REPLACE FUNCTION link_pending_invitations()
RETURNS TRIGGER AS $$
BEGIN
  -- Collega inviti pendenti quando viene creato un profilo
  UPDATE tournament_collaborators
  SET 
    user_id = NEW.id,
    status = 'accepted',
    accepted_at = NOW()
  WHERE 
    invited_email = NEW.email 
    AND status = 'pending'
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per collegare automaticamente
DROP TRIGGER IF EXISTS link_invitations_on_profile_create ON user_profiles;
CREATE TRIGGER link_invitations_on_profile_create
AFTER INSERT OR UPDATE OF email ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION link_pending_invitations();

-- Policy per permettere di vedere tornei dove si è collaboratori
DROP POLICY IF EXISTS "Collaborators can view tournaments" ON tournaments;
CREATE POLICY "Collaborators can view tournaments"
ON tournaments FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  EXISTS (
    SELECT 1 FROM tournament_collaborators
    WHERE tournament_id = tournaments.id
    AND (
      (user_id = auth.uid() AND status = 'accepted')
      OR
      (invited_email = (SELECT email FROM user_profiles WHERE id = auth.uid()) AND status IN ('pending', 'accepted'))
    )
  )
);
