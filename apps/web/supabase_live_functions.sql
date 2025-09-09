-- Funzione per iniziare una diretta (consuma 1 credito)
CREATE OR REPLACE FUNCTION public.start_live_stream(
    p_user_id UUID,
    p_event_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_balance INTEGER;
    v_stream_id UUID;
BEGIN
    -- Verifica crediti disponibili
    SELECT balance INTO v_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF v_balance < 1 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Crediti insufficienti'
        );
    END IF;
    
    -- Consuma 1 credito
    UPDATE public.user_credits
    SET 
        balance = balance - 1,
        total_consumed = total_consumed + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Registra transazione
    INSERT INTO public.credit_transactions (
        user_id, 
        amount, 
        balance_after,
        type, 
        description,
        reference_id
    )
    VALUES (
        p_user_id, 
        -1, 
        v_balance - 1,
        'consume',
        'Diretta streaming',
        p_event_id::TEXT
    );
    
    -- Crea record live_stream
    INSERT INTO public.live_streams (
        event_id,
        stream_key,
        status,
        started_at
    )
    VALUES (
        p_event_id,
        gen_random_uuid()::TEXT,
        'live',
        NOW()
    )
    RETURNING id INTO v_stream_id;
    
    -- Aggiorna stato evento
    UPDATE public.events
    SET status = 'live'
    WHERE id = p_event_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'stream_id', v_stream_id,
        'credits_remaining', v_balance - 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per salvare highlight (durante la diretta)
CREATE OR REPLACE FUNCTION public.save_highlight(
    p_stream_id UUID,
    p_timestamp INTEGER,
    p_title TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_highlight_id UUID;
    v_event_id UUID;
BEGIN
    -- Recupera event_id dal live stream
    SELECT event_id INTO v_event_id
    FROM public.live_streams
    WHERE id = p_stream_id;
    
    -- Crea record highlight (ultimi 30 secondi)
    INSERT INTO public.event_highlights (
        event_id,
        title,
        start_time_seconds,
        end_time_seconds,
        highlight_type,
        tags
    )
    VALUES (
        v_event_id,
        COALESCE(p_title, 'Highlight ' || TO_CHAR(NOW(), 'HH24:MI:SS')),
        GREATEST(0, p_timestamp - 30),
        p_timestamp,
        'manual',
        ARRAY['live_capture']
    )
    RETURNING id INTO v_highlight_id;
    
    RETURN v_highlight_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per terminare la diretta
CREATE OR REPLACE FUNCTION public.end_live_stream(
    p_stream_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Aggiorna live stream
    UPDATE public.live_streams
    SET 
        status = 'ended',
        ended_at = NOW()
    WHERE id = p_stream_id;
    
    -- Aggiorna evento
    UPDATE public.events
    SET status = 'completed'
    WHERE id = (
        SELECT event_id 
        FROM public.live_streams 
        WHERE id = p_stream_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
