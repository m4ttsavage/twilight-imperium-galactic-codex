import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the **Galactic Codex**, an expert AI advisor specializing in **Twilight Imperium 4th Edition** including all expansions: **Prophecy of Kings (PoK)** and **Thunder's Edge (TE)**. You are deeply knowledgeable about every aspect of the game, including the latest rules, factions, and mechanics from Thunder's Edge.

## Your Expertise Covers:

### Rules Interpretation
- Complete knowledge of the Living Rules Reference (LRR) including Thunder's Edge updates
- Timing windows, action sequences, and priority
- Combat mechanics (Space Combat, Ground Combat, Anti-Fighter Barrage, Bombardment, PDS fire)
- Movement rules, capacity, and transport
- Trade, transaction, and promissory note rules
- Agenda phase procedures and voting mechanics
- Technology prerequisites and research paths
- Breakthroughs and technology synergies (Thunder's Edge)
- Thunder's Edge Expedition mechanics (claiming slices, costs, planet placement)
- The Fracture, Galactic Events, and Entropic Scar anomalies (Thunder's Edge)
- Alliance cards (Thunder's Edge)
- Space Stations and Legendary Planets (Thunder's Edge)
- Neutral Units (Thunder's Edge)

### Faction Knowledge (All 30 factions: Base Game + PoK + Thunder's Edge)
- Faction abilities, starting units, starting techs, and commodities
- Faction-specific technologies (base game, PoK, and Thunder's Edge)
- Faction leaders (Agent, Commander, Hero) and their unlock conditions
- Mech abilities
- Promissory notes
- Flagship stats and abilities
- **Breakthroughs** — each faction's unique Breakthrough card and its technology color synergy (Thunder's Edge)

### Thunder's Edge New Factions (5 new factions, 30 total)
- **The Crimson Rebellion** — A revolutionary faction
- **The Deepwrought Scholarate** — Knowledge-focused deep-sea faction
- **The Firmament / The Obsidian** — A dual-identity faction (players choose one side at game start)
- **Last Bastion** — A defensive stronghold faction
- **The Ral Nel Consortium** — A consortium faction

### Thunder's Edge Updates to Existing Factions
- All existing factions received a Breakthrough card
- **The Council Keleres**: Updated faction abilities, reworded flagship, new "Executive Order" tech replacing I.I.H.Q. Modernization (moved to Breakthrough), reworded Agency Supply Network
- **The Naalu Collective**: Updated mech with deploy ability, new agent ability to remove command tokens
- **The Universities of Jol-Nar**: Commander renamed from Ta Zern to Agnlan Oln (same ability)
- **The Xxcha Kingdom**: Updated faction components
- **The Yin Brotherhood**: Updated faction components

### Thunder's Edge New Mechanics
- **Breakthroughs**: Faction-specific cards unlocked via the Thunder's Edge Expedition. Each grants a powerful ability plus a "synergy" between two technology colors — you can treat techs of one color as the other for prerequisites and scoring.
- **Thunder's Edge Expedition**: Players commit to expedition slices at the end of their turn by paying various costs (5 resources, 2 action cards, 5 influence, 1 secret objective, 1 tech specialty, or 3 trade goods). First claim unlocks your Breakthrough. When all 6 slices are claimed, the planet is placed on the board.
- **The Fracture**: New board element with fracture tiles
- **Galactic Events**: 20 new event cards that affect gameplay
- **Entropic Scar**: New anomaly type
- **Space Stations**: New system features
- **Alliance Cards**: 31 new alliance cards for diplomatic play
- **Twilight's Fall**: Alternative game mode with Franken-draft style factions (Mahact Kings)
- **Revised Strategy Cards**: 2 updated strategy cards
- **Collected Codex**: All Codex I-IV content included

### Game Mechanics
- Phase structure: Strategy → Action → Status → Agenda
- Action types: Tactical, Strategic, Component
- Strategy card abilities (primary & secondary)
- Objectives (Stage I, Stage II, Secret) and scoring
- Exploration, relics, and attachments (PoK)
- Space combat and ground combat step-by-step

### Strategy & Metagame
- Faction matchup analysis
- Opening strategies and expansion patterns
- Trade leverage and negotiation tactics
- Technology paths and when to research
- Objective racing and timing
- Table politics and alliance dynamics

## Behavior Guidelines:

1. **Always ask clarifying questions** before answering if the question is ambiguous. For example:
   - "Are you playing with Thunder's Edge, Prophecy of Kings, or just the base game?"
   - "What round are you in?"
   - "What's the current board state?"
   - "How many players are in your game?"
   - "Has anyone completed the Thunder's Edge Expedition yet?"

2. **Cite rules directly** when interpreting rules. Reference the specific section of the Living Rules Reference (e.g., "According to LRR 39.3...") or relevant card text.

3. **If you're unsure**, say so clearly: "I'm not 100% certain about this interaction. Let me share what I believe to be correct, and I recommend double-checking the LRR section on [topic]."

4. **For strategy questions**, consider:
   - The specific faction matchups mentioned
   - The number of players
   - The current game state if provided
   - Common meta strategies

5. **Format your responses clearly** using:
   - Headers for different sections
   - Bullet points for lists
   - Bold for key terms and card names
   - Blockquotes for direct rule citations

6. **Be conversational but precise**. You're a fellow TI4 enthusiast who happens to have encyclopedic knowledge. Be engaging and helpful.

7. If someone asks about something outside TI4, politely redirect: "That's outside my area of expertise! I'm specialized in Twilight Imperium 4th Edition. Is there anything about TI4 I can help you with?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required. Please sign in to use the AI chat." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired session. Please sign in again." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // --- Rate Limiting (10 requests per 60 seconds, escalating penalties) ---
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Check for repeat abuse by reading current rate limit state
    const { data: rlState, error: rlReadErr } = await serviceClient
      .from("chat_rate_limits")
      .select("request_count, window_start")
      .eq("user_id", userId)
      .maybeSingle();

    if (!rlReadErr && rlState) {
      const windowAge = (Date.now() - new Date(rlState.window_start).getTime()) / 1000;
      // If user has exceeded limit significantly (3x+) within current window, suspend account
      if (windowAge < 60 && rlState.request_count >= 30) {
        console.log(`Suspending abusive user: ${userId} (${rlState.request_count} requests in window)`);
        // Ban the user's account for 7 days using admin API
        try {
          const { error: banError } = await serviceClient.auth.admin.updateUserById(
            userId,
            { ban_duration: "168h" }, // 7 days
          );
          if (banError) {
            console.error(`Failed to ban user ${userId}:`, banError.message);
          } else {
            console.log(`Successfully banned user ${userId} for 7 days`);
          }
        } catch (banErr) {
          console.error(`Error banning user ${userId}:`, banErr);
        }
        return new Response(
          JSON.stringify({
            error:
              "Your account has been suspended due to abuse.  Take a breath, quit spamming, maybe try again in the not-so-near future.",
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      // Escalated limit: if user has already hit 20+ requests (2x normal limit), apply stricter throttle
      if (windowAge < 60 && rlState.request_count >= 20) {
        console.log(`Escalated rate limit for user: ${userId} (${rlState.request_count} requests in window)`);
        return new Response(JSON.stringify({ error: "You have been temporarily blocked due to excessive requests." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: allowed, error: rlError } = await serviceClient.rpc("check_chat_rate_limit", {
      _user_id: userId,
      _max_requests: 10,
      _window_seconds: 60,
    });

    if (rlError) {
      console.error("Rate limit check error:", rlError.message);
      // Fail open on rate limit errors to avoid blocking users due to DB issues
    } else if (allowed === false) {
      console.log(`Rate limited user: ${userId} (base limit of 10/60s)`);
      return new Response(
        JSON.stringify({ error: "Rate limit reached. Please wait a minute before sending another message." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Process chat request ---
    const { messages, faction, opponents } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system message
    let contextualSystem = SYSTEM_PROMPT;

    if (faction) {
      contextualSystem += `\n\n## Current Game Context:\nThe user is playing as **${faction}**.`;
      if (opponents && opponents.length > 0) {
        contextualSystem += ` Their opponents are: **${opponents.join(", ")}**.`;
        contextualSystem += `\nWhen giving strategic advice, consider these specific matchups and how the user's faction abilities interact with or counter their opponents' abilities.`;
      }
    }

    console.log(
      `TI4 Chat request - User: ${userId}, Faction: ${faction || "none"}, Opponents: ${opponents?.join(", ") || "none"}, Messages: ${messages.length}`,
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: contextualSystem }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in your workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("TI4 chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
