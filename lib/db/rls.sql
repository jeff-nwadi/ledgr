-- Enable Row Level Security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "business" ENABLE ROW LEVEL SECURITY;

-- We use a custom configuration parameter 'app.current_business_id'
-- that will be set by the application on each request (e.g. via set_config)

-- Policy for 'business' table
-- A user can only see the business they belong to, or if they are logging in (handled by SECURITY DEFINER functions or bypassing RLS via service role).
-- Assuming the backend will set app.current_business_id when performing tenant-specific queries:
CREATE POLICY tenant_isolation_business ON "business"
  FOR ALL
  USING (
    id = current_setting('app.current_business_id', true)
    OR current_setting('app.current_business_id', true) IS NULL
  );

-- Policy for 'user' table
CREATE POLICY tenant_isolation_user ON "user"
  FOR ALL
  USING (
    business_id = current_setting('app.current_business_id', true)
    OR current_setting('app.current_business_id', true) IS NULL
  );

-- Note: The "IS NULL" allows the application to query across all if the setting is not set.
-- In a strict setup, you might remove the IS NULL clause, but that requires
-- ensuring 'app.current_business_id' is always set correctly, even during sign up.
