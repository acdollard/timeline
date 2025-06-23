import { s as supabase } from '../../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*").limit(5);
    if (error) {
      console.error("Supabase connection test failed:", error);
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to connect to Supabase",
        error: error.message,
        details: error.details,
        hint: error.hint
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Raw data from Supabase:", data);
    return new Response(JSON.stringify({
      status: "success",
      message: "Successfully connected to Supabase",
      data,
      config: {
        url: "https://vsyjaxxvuvebfgrmwqkn.supabase.co" ? "Set" : "Not Set",
        key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWpheHh2dXZlYmZncm13cWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTg5NTYsImV4cCI6MjA2NDI5NDk1Nn0.NiAWk-fkKmOwAyALOvpOsPdnHOcXhiDNc9yJlBfQ-n0" ? "Set" : "Not Set"
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: "Unexpected error",
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
