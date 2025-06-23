import { s as supabase } from '../../../chunks/supabase_riZVRtFr.mjs';
export { renderers } from '../../../renderers.mjs';

const PUT = async ({ params, request }) => {
  try {
    const id = params.id;
    const event = await request.json();
    const { data, error } = await supabase.from("events").update(event).eq("id", id).select().single();
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error updating event:", error);
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
    const id = params.id;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting event:", error);
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
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
