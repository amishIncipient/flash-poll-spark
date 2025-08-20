create or replace function create_poll_with_options(
  poll_title text,
  options_text text[],
  creator_id uuid
)
returns uuid
language plpgsql
as $$
declare
  new_poll_id uuid;
begin
  -- Insert a new poll and get its ID
  insert into public.polls (title, user_id)
  values (poll_title, creator_id)
  returning id into new_poll_id;

  -- Insert all poll options
  if array_length(options_text, 1) > 0 then
    for i in 1..array_length(options_text, 1) loop
      insert into public.poll_options (poll_id, option_text)
      values (new_poll_id, options_text[i]);
    end loop;
  end if;

  -- Return the new poll's ID
  return new_poll_id;
end;
$$;
