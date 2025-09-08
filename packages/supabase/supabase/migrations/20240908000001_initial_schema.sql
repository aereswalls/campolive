-- ============================================
-- CampoLive Database Schema
-- Version: 1.0.0
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'coach', 'manager', 'fan', 'admin')),
    team_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles" 
    ON public.user_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- ============================================
-- TEAMS & ORGANIZATIONS
-- ============================================

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    sport_type VARCHAR(50) DEFAULT 'calcio',
    level VARCHAR(50) DEFAULT 'amatoriale',
    city VARCHAR(100),
    province VARCHAR(100),
    region VARCHAR(100),
    founded_year INTEGER,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    is_verified BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player',
    jersey_number INTEGER,
    position VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREDITS SYSTEM
-- ============================================

CREATE TABLE public.user_credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    total_purchased INTEGER DEFAULT 0,
    total_consumed INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Credit transactions
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type VARCHAR(50) CHECK (type IN (
        'purchase_web', 
        'purchase_ios', 
        'purchase_android', 
        'consume', 
        'refund', 
        'bonus', 
        'referral'
    )),
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    reference_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Credit packages
CREATE TABLE public.credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price_web DECIMAL(10,2) NOT NULL,
    price_ios DECIMAL(10,2) NOT NULL,
    price_android DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'partita',
    sport_type VARCHAR(50) DEFAULT 'calcio',
    home_team_id UUID REFERENCES public.teams(id),
    away_team_id UUID REFERENCES public.teams(id),
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_latitude DECIMAL(10,8),
    venue_longitude DECIMAL(11,8),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 90,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 
        'live', 
        'completed', 
        'cancelled'
    )),
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    credits_required INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Event recordings
CREATE TABLE public.event_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    recording_type VARCHAR(50) DEFAULT 'main',
    storage_path TEXT NOT NULL,
    public_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    file_size_mb DECIMAL(10,2),
    resolution VARCHAR(20),
    fps INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_recordings ENABLE ROW LEVEL SECURITY;

-- Event highlights
CREATE TABLE public.event_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    recording_id UUID REFERENCES public.event_recordings(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    start_time_seconds INTEGER NOT NULL,
    end_time_seconds INTEGER NOT NULL,
    highlight_type VARCHAR(50) DEFAULT 'manual',
    ai_confidence DECIMAL(3,2),
    tags TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_highlights ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LIVE STREAMING
-- ============================================

CREATE TABLE public.live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    stream_url TEXT,
    playback_url TEXT,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN (
        'waiting',
        'live',
        'ended',
        'error'
    )),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    viewer_count INTEGER DEFAULT 0,
    max_viewers INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STATISTICS
-- ============================================

CREATE TABLE public.event_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id),
    player_id UUID REFERENCES auth.users(id),
    stat_type VARCHAR(50) NOT NULL,
    value INTEGER DEFAULT 0,
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 10); -- Bonus iniziale di 10 crediti
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to consume credits
CREATE OR REPLACE FUNCTION public.consume_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_event_id UUID,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Lock the row to prevent race conditions
    SELECT balance INTO v_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF v_balance >= p_amount THEN
        -- Update balance
        UPDATE public.user_credits
        SET 
            balance = balance - p_amount,
            total_consumed = total_consumed + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Record transaction
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
            -p_amount, 
            v_balance - p_amount,
            'consume',
            COALESCE(p_description, 'Event recording'),
            p_event_id::TEXT
        );
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR(50),
    p_reference VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Update balance
    UPDATE public.user_credits
    SET 
        balance = balance + p_amount,
        total_purchased = CASE 
            WHEN p_type LIKE 'purchase%' THEN total_purchased + p_amount 
            ELSE total_purchased 
        END,
        total_earned = CASE 
            WHEN p_type IN ('bonus', 'referral') THEN total_earned + p_amount 
            ELSE total_earned 
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;
    
    -- Record transaction
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
        p_amount,
        v_new_balance,
        p_type,
        p_description,
        p_reference
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_events_scheduled_at ON public.events(scheduled_at);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price_web, price_ios, price_android, is_popular, sort_order) VALUES
    ('Starter', 10, 8.99, 10.99, 10.99, false, 1),
    ('Popular', 30, 23.99, 29.99, 29.99, true, 2),
    ('Pro', 60, 41.99, 54.99, 54.99, false, 3),
    ('Team', 150, 89.99, 119.99, 119.99, false, 4),
    ('League', 500, 249.99, 349.99, 349.99, false, 5);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;