import { e as eventTypeService } from '../../../chunks/eventTypeService_G9offj3H.mjs';
import { l as logger } from '../../../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Event type ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const eventType = await eventTypeService.getById(params.id);
    return new Response(JSON.stringify(eventType), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    logger.error("Failed to fetch event type", {
      id: params.id,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return new Response(JSON.stringify({
      error: "Failed to fetch event type",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const PUT = async ({ params, request }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: "Event type ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const updates = await request.json();
    if (updates.color) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      if (!colorRegex.test(updates.color)) {
        return new Response(JSON.stringify({
          error: "Invalid color format. Use hex format (e.g., #3B82F6)"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
    }
    const updatedEventType = await eventTypeService.update(params.id, updates);
    return new Response(JSON.stringify(updatedEventType), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    logger.error("Failed to update event type", {
      id: params.id,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return new Response(JSON.stringify({
      error: "Failed to update event type",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
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
      return new Response(JSON.stringify({ error: "Event type ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await eventTypeService.delete(params.id);
    return new Response(null, {
      status: 204
    });
  } catch (error) {
    logger.error("Failed to delete event type", {
      id: params.id,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return new Response(JSON.stringify({
      error: "Failed to delete event type",
      details: error instanceof Error ? error.message : "Unknown error"
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
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
