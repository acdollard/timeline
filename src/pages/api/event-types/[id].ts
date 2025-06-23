import type { APIRoute } from 'astro';
import { eventTypeService } from '../../../services/eventTypeService';
import { logger } from '../../../utils/logger';

export const GET: APIRoute = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const eventType = await eventTypeService.getById(params.id);
    
    return new Response(JSON.stringify(eventType), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Failed to fetch event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const updates = await request.json();
    
    // Validate color format if provided
    if (updates.color) {
      const colorRegex = /^#[0-9A-F]{6}$/i;
      if (!colorRegex.test(updates.color)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid color format. Use hex format (e.g., #3B82F6)' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    const updatedEventType = await eventTypeService.update(params.id, updates);
    
    return new Response(JSON.stringify(updatedEventType), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Failed to update event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to update event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(JSON.stringify({ error: 'Event type ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await eventTypeService.delete(params.id);
    
    return new Response(null, {
      status: 204
    });
  } catch (error) {
    logger.error('Failed to delete event type', { 
      id: params.id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to delete event type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 