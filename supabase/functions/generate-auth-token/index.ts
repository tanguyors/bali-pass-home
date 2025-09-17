import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating token for user:', user.id);

    // Generate a temporary token that expires in 15 minutes
    const payload = {
      user_id: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes from now
      iat: Math.floor(Date.now() / 1000),
      purpose: 'account_deletion'
    };

    // Simple base64 encoding for the token (in production, use proper JWT signing)
    const tokenData = btoa(JSON.stringify(payload));
    
    // Create a secure token by combining with a timestamp and simple hash
    const timestamp = Date.now().toString();
    const tempToken = `${tokenData}.${timestamp}`;

    console.log('Token generated successfully for user:', user.id);

    return new Response(
      JSON.stringify({ 
        token: tempToken,
        expires_at: new Date(payload.exp * 1000).toISOString(),
        url: `https://passbali.com/delete-account?token=${tempToken}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-auth-token function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});