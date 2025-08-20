ALTER TABLE public.polls
DROP CONSTRAINT IF EXISTS polls_user_id_title_key;

ALTER TABLE public.polls
ADD CONSTRAINT polls_user_id_title_key UNIQUE (user_id, title);
