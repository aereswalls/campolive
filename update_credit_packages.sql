-- Aggiorna i pacchetti crediti con i nuovi prezzi
-- 1 credito = 1 diretta completa con highlights

-- Prima elimina i vecchi pacchetti
DELETE FROM public.credit_packages;

-- Inserisci i nuovi pacchetti con prezzi corretti
INSERT INTO public.credit_packages (name, credits, price_web, price_ios, price_android, discount_percentage, is_popular, sort_order) VALUES
    ('Starter', 5, 20.00, 24.99, 24.99, 0, false, 1),
    ('Popular', 12, 36.00, 44.99, 44.99, 25, true, 2),
    ('Pro', 30, 60.00, 74.99, 74.99, 50, false, 3),
    ('Team', 100, 100.00, 124.99, 124.99, 75, false, 4);

-- Verifica i pacchetti inseriti
SELECT 
    name,
    credits as "Dirette",
    price_web as "€ Web",
    price_ios as "€ iOS",
    ROUND(price_web::numeric / credits, 2) as "€/Diretta",
    discount_percentage as "Sconto %"
FROM credit_packages
ORDER BY sort_order;
