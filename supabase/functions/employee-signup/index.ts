import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SignupPayload = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, firstName, lastName }: SignupPayload = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Email, password, first name, and last name are required." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration missing." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: "employee",
      },
    });

    if (error) {
      const message = error.message?.toLowerCase() || "";
      const status = message.includes("already") || message.includes("registered") ? 409 : 400;

      return new Response(JSON.stringify({ error: error.message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createdUser = data.user;

    if (!createdUser?.id || !createdUser.email) {
      return new Response(JSON.stringify({ error: "User creation failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingProfile, error: profileFetchError } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("user_id", createdUser.id)
      .maybeSingle();

    if (profileFetchError) {
      return new Response(JSON.stringify({ error: profileFetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingProfile) {
      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          email: createdUser.email,
          first_name: firstName,
          last_name: lastName,
        })
        .eq("user_id", createdUser.id);

      if (profileUpdateError) {
        return new Response(JSON.stringify({ error: profileUpdateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: profileInsertError } = await adminClient.from("profiles").insert({
        user_id: createdUser.id,
        email: createdUser.email,
        first_name: firstName,
        last_name: lastName,
      });

      if (profileInsertError) {
        return new Response(JSON.stringify({ error: profileInsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: existingRole, error: roleFetchError } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", createdUser.id)
      .maybeSingle();

    if (roleFetchError) {
      return new Response(JSON.stringify({ error: roleFetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingRole) {
      const { error: roleUpdateError } = await adminClient
        .from("user_roles")
        .update({ role: "employee" })
        .eq("user_id", createdUser.id);

      if (roleUpdateError) {
        return new Response(JSON.stringify({ error: roleUpdateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: roleInsertError } = await adminClient.from("user_roles").insert({
        user_id: createdUser.id,
        role: "employee",
      });

      if (roleInsertError) {
        return new Response(JSON.stringify({ error: roleInsertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: createdUser.id,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
