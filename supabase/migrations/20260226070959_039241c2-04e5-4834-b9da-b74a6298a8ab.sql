INSERT INTO public.profiles (user_id, email, first_name, last_name)
VALUES (
  'be3f99e4-e6b3-4e83-9989-91c336eed1b9',
  'vishwakarmasachin762@gmail.com',
  'sachin',
  'vishwakarma'
)
ON CONFLICT (user_id) DO NOTHING;