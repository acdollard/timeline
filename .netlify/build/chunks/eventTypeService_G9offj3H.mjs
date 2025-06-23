import { s as supabase } from './supabase_riZVRtFr.mjs';
import { l as logger } from './logger_BUOLHH5s.mjs';

class EventTypeService {
  async getAll() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");
      const { data, error } = await supabase.from("event_types").select("*").or(`is_default.eq.true,user_id.eq.${session.user.id}`).eq("is_active", true).order("is_default", { ascending: false }).order("display_name", { ascending: true });
      if (error) throw error;
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error("Failed to fetch event types", { error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }
  async getDefault() {
    try {
      const { data, error } = await supabase.from("event_types").select("*").eq("is_default", true).eq("is_active", true).order("display_name", { ascending: true });
      if (error) throw error;
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error("Failed to fetch default event types", { error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }
  async getCustom() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");
      const { data, error } = await supabase.from("event_types").select("*").eq("user_id", session.user.id).eq("is_active", true).order("display_name", { ascending: true });
      if (error) throw error;
      return data?.map(this.mapDatabaseToType) || [];
    } catch (error) {
      logger.error("Failed to fetch custom event types", { error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  }
  async create(eventType) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");
      const { data: existing } = await supabase.from("event_types").select("id").eq("name", eventType.name).single();
      if (existing) {
        throw new Error("Event type with this name already exists");
      }
      const { data, error } = await supabase.from("event_types").insert([{
        name: eventType.name,
        display_name: eventType.displayName,
        color: eventType.color,
        icon: eventType.icon,
        user_id: session.user.id,
        is_default: false,
        is_active: true
      }]).select().single();
      if (error) throw error;
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error("Failed to create event type", {
        eventType,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  async update(id, updates) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");
      const updateData = {};
      if (updates.displayName !== void 0) updateData.display_name = updates.displayName;
      if (updates.color !== void 0) updateData.color = updates.color;
      if (updates.icon !== void 0) updateData.icon = updates.icon;
      if (updates.isActive !== void 0) updateData.is_active = updates.isActive;
      const { data, error } = await supabase.from("event_types").update(updateData).eq("id", id).eq("user_id", session.user.id).select().single();
      if (error) throw error;
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error("Failed to update event type", {
        id,
        updates,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  async delete(id) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");
      const { data: eventsUsingType } = await supabase.from("events").select("id").eq("event_type_id", id).limit(1);
      if (eventsUsingType && eventsUsingType.length > 0) {
        throw new Error("Cannot delete event type that is being used by events");
      }
      const { error } = await supabase.from("event_types").delete().eq("id", id).eq("user_id", session.user.id);
      if (error) throw error;
    } catch (error) {
      logger.error("Failed to delete event type", {
        id,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  async getById(id) {
    try {
      const { data, error } = await supabase.from("event_types").select("*").eq("id", id).single();
      if (error) throw error;
      return this.mapDatabaseToType(data);
    } catch (error) {
      logger.error("Failed to fetch event type by ID", {
        id,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  mapDatabaseToType(data) {
    return {
      id: data.id,
      name: data.name,
      displayName: data.display_name,
      color: data.color,
      icon: data.icon,
      isDefault: data.is_default,
      isActive: data.is_active,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
const eventTypeService = new EventTypeService();

export { eventTypeService as e };
