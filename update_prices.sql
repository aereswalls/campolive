-- Aggiorna i pacchetti crediti con i nuovi prezzi
DELETE FROM public.credit_packages;

INSERT INTO public.credit_packages (name, credits, price_web, price_ios, price_android, discount_percentage, is_popular, sort_order) VALUES
    ('Starter', 5, 30.00, 39.99, 39.99, 0, false, 1),
    ('Popular', 12, 60.00, 79.99, 79.99, 17, true, 2),
    ('Pro', 30, 120.00, 159.99, 159.99, 33, false, 3),
    ('Team', 100, 300.00, 399.99, 399.99, 50, false, 4);

-- Verifica
SELECT 
    name,
    credits as "Dirette",
    price_web as "€ Web",
    ROUND(price_web::numeric / credits, 2) as "€/Diretta",
    discount_percentage as "Sconto %"
FROM credit_packages
ORDER BY sort_order;
