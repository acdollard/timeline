import { e as eventTypeService } from '../../chunks/eventTypeService_G9offj3H.mjs';
import { l as logger } from '../../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async () => {
  try {
    const eventTypes = await eventTypeService.getAll();
    return new Response(JSON.stringify(eventTypes), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    logger.error("Failed to fetch event types", { error: error instanceof Error ? error.message : "Unknown error" });
    return new Response(JSON.stringify({
      error: "Failed to fetch event types",
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
    const eventType = await request.json();
    if (!eventType.name || !eventType.displayName || !eventType.color) {
      return new Response(JSON.stringify({
        error: "Missing required fields: name, displayName, and color are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(eventType.color)) {
      return new Response(JSON.stringify({
        error: "Invalid color format. Use hex format (e.g., #3B82F6)"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const createdEventType = await eventTypeService.create(eventType);
    return new Response(JSON.stringify(createdEventType), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    logger.error("Failed to create event type", { error: error instanceof Error ? error.message : "Unknown error" });
    return new Response(JSON.stringify({
      error: "Failed to create event type",
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
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
