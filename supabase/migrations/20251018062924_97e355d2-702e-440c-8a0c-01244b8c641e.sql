-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to automatically translate offers every day at 2 AM
SELECT cron.schedule(
  'auto-translate-offers-daily',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://vdlbezzgoxaoiumlsgpp.supabase.co/functions/v1/translate-offers',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkbGJlenpnb3hhb2l1bWxzZ3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzc3OTcsImV4cCI6MjA3MDgxMzc5N30.lEPJWuWG2z7lsq8bTizeARpvIMeixTrPAnEpG9oOb7I"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
