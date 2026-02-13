import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // ---------- GET actions ----------
    if (req.method === "GET") {
      if (action === "list") {
        const userId = url.searchParams.get("user_id");
        if (!userId) return err("user_id required");

        const { data, error } = await supabase
          .from("chat_conversations")
          .select("id, title, created_at, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(50);

        if (error) return err(error.message, 500);
        return json(data);
      }

      if (action === "messages") {
        const convId = url.searchParams.get("conversation_id");
        const userId = url.searchParams.get("user_id");
        if (!convId || !userId) return err("conversation_id and user_id required");

        // Verify ownership
        const { data: conv } = await supabase
          .from("chat_conversations")
          .select("user_id")
          .eq("id", convId)
          .single();

        if (!conv || conv.user_id !== userId) return err("Not found", 404);

        const { data, error } = await supabase
          .from("chat_messages")
          .select("id, role, content, feedback, created_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (error) return err(error.message, 500);
        return json(data);
      }

      return err("Unknown GET action");
    }

    // ---------- POST actions ----------
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "create") {
        const { user_id, title } = body;
        if (!user_id) return err("user_id required");

        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({ user_id, title: title || "New Conversation" })
          .select("id")
          .single();

        if (error) return err(error.message, 500);
        return json(data, 201);
      }

      if (action === "message") {
        const { conversation_id, user_id, role, content } = body;
        if (!conversation_id || !user_id || !role || !content)
          return err("conversation_id, user_id, role, content required");

        // Verify ownership
        const { data: conv } = await supabase
          .from("chat_conversations")
          .select("user_id")
          .eq("id", conversation_id)
          .single();

        if (!conv || conv.user_id !== user_id) return err("Not found", 404);

        const { data, error } = await supabase
          .from("chat_messages")
          .insert({ conversation_id, role, content })
          .select("id")
          .single();

        if (error) return err(error.message, 500);

        // Touch conversation updated_at
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversation_id);

        return json(data, 201);
      }

      if (action === "feedback") {
        const { message_id, user_id, feedback } = body;
        if (!message_id || !user_id || !feedback)
          return err("message_id, user_id, feedback required");

        // Verify ownership via conversation
        const { data: msg } = await supabase
          .from("chat_messages")
          .select("conversation_id")
          .eq("id", message_id)
          .single();

        if (!msg) return err("Not found", 404);

        const { data: conv } = await supabase
          .from("chat_conversations")
          .select("user_id")
          .eq("id", msg.conversation_id)
          .single();

        if (!conv || conv.user_id !== user_id) return err("Not found", 404);

        const { error } = await supabase
          .from("chat_messages")
          .update({ feedback })
          .eq("id", message_id);

        if (error) return err(error.message, 500);
        return json({ ok: true });
      }

      return err("Unknown POST action");
    }

    // ---------- DELETE actions ----------
    if (req.method === "DELETE") {
      if (action === "delete") {
        const convId = url.searchParams.get("conversation_id");
        const userId = url.searchParams.get("user_id");
        if (!convId || !userId) return err("conversation_id and user_id required");

        // Verify ownership
        const { data: conv } = await supabase
          .from("chat_conversations")
          .select("user_id")
          .eq("id", convId)
          .single();

        if (!conv || conv.user_id !== userId) return err("Not found", 404);

        // Delete messages first, then conversation
        await supabase.from("chat_messages").delete().eq("conversation_id", convId);
        await supabase.from("chat_conversations").delete().eq("id", convId);

        return json({ ok: true });
      }

      return err("Unknown DELETE action");
    }

    return err("Method not allowed", 405);
  } catch (e) {
    console.error("chat-history error:", e);
    return err("Internal error", 500);
  }
});
