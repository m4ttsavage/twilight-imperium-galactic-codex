-- Drop overly permissive SELECT policies on games table
DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can view any game" ON public.games;