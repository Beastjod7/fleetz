-- Update RLS policy for admins to insert trips
-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage all trips" ON trips;

-- Recreate the policy with proper permissions
CREATE POLICY "Admins can manage all trips"
ON trips
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));