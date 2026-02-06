import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the **Galactic Codex**, an expert AI advisor specializing in **Twilight Imperium 4th Edition** (including the Prophecy of Kings expansion). You are deeply knowledgeable about every aspect of the game.

## Your Expertise Covers:

### Rules Interpretation
- Complete knowledge of the Living Rules Reference (LRR)
- Timing windows, action sequences, and priority
- Combat mechanics (Space Combat, Ground Combat, Anti-Fighter Barrage, Bombardment, PDS fire)
- Movement rules, capacity, and transport
- Trade, transaction, and promissory note rules
- Agenda phase procedures and voting mechanics
- Technology prerequisites and research paths

### Faction Knowledge (All 25 factions including PoK)
- Faction abilities, starting units, starting techs, and commodities
- Faction-specific technologies (both base game and PoK)
- Faction leaders (Agent, Commander, Hero) and their unlock conditions
- Mech abilities
- Promissory notes
- Flagship stats and abilities

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
   - "Are you playing with or without Prophecy of Kings?"
   - "What round are you in?"
   - "What's the current board state?"
   - "How many players are in your game?"

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

    console.log(`TI4 Chat request - Faction: ${faction || "none"}, Opponents: ${opponents?.join(", ") || "none"}, Messages: ${messages.length}`);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: contextualSystem },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in your workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("TI4 chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
