import { s as supabase } from '../../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    if (params.id) {
      const { data: data2, error: error2 } = await supabase.from("events").select("*").eq("id", params.id).single();
      if (error2) {
        console.error("Supabase error (single event):", error2);
        throw error2;
      }
      console.log("Successfully fetched event:", data2);
      return new Response(JSON.stringify(data2), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Fetching all events from Supabase...");
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
    if (error) {
      console.error("Supabase error (all events):", error);
      throw error;
    }
    console.log("Successfully fetched events:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const event = await request.json();
    const { data, error } = await supabase.from("events").insert([event]).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create event" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const PUT = async ({ request, params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Event ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const event = await request.json();
    const { data, error } = await supabase.from("events").update(event).eq("id", params.id).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update event" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const DELETE = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Event ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const { error } = await supabase.from("events").delete().eq("id", params.id);
    if (error) throw error;
    return new Response(null, {
      status: 204
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete event" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
