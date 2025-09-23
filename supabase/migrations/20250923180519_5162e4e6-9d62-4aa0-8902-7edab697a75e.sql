-- Update the handle_new_user function to also assign roles from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Assign role from metadata if present
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::app_role
    );
  END IF;
  
  RETURN NEW;
END;
$$;