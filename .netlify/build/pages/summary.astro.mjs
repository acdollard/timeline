import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DuNtUCWs.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DKDPCBi2.mjs';
import { s as supabase } from '../chunks/supabase_riZVRtFr.mjs';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import React, { useState, useEffect } from 'react';
import { l as logger } from '../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../renderers.mjs';

const DEFAULT_COLORS = {
  "birth": "#EF4444",
  "school": "#10B981",
  "travel": "#F59E0B",
  "relationships": "#EC4899",
  "move": "#8B5CF6",
  "career": "#06B6D4",
  "bucket-list": "#F97316",
  "hobbies": "#6366F1"
};
const getPinColor = (eventType) => {
  if (typeof eventType === "string") {
    return DEFAULT_COLORS[eventType] || "#c2c2c2";
  } else {
    return eventType.color || "#c2c2c2";
  }
};

const Pin = ({ event, isBirth = false, handleClick, orientation = "horizontal" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    return getPinColor(event.type || "birth");
  };
  const tooltipClasses = orientation === "horizontal" ? "absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap" : "absolute -translate-y-1/2 -right-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap";
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "pin relative",
      onPointerEnter: () => {
        setShowTooltip(true);
      },
      onPointerLeave: () => {
        setShowTooltip(false);
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "event rounded-full transition-all duration-200 absolute h-6 w-6 hover:scale-150 cursor-pointer",
            style: {
              backgroundColor: getEventColor(),
              left: orientation === "horizontal" ? "50%" : void 0,
              top: orientation === "vertical" ? "50%" : void 0,
              transform: orientation === "horizontal" ? "translateX(-50%)" : orientation === "vertical" ? "translateY(-50%)" : void 0
            },
            onClick: () => handleClick(event)
          }
        ),
        showTooltip && /* @__PURE__ */ jsxs(
          "div",
          {
            className: tooltipClasses,
            style: { pointerEvents: "none" },
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold", children: event.name }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-300", children: formattedDate })
            ]
          }
        ),
        !isBirth && /* @__PURE__ */ jsx("div", { className: `${orientation === "horizontal" ? "h-20 w-0.5 bg-white mx-auto" : "w-20 h-0.5 bg-white my-auto"}` })
      ]
    }
  ) });
};

const EventModal = ({ event, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !event) return null;
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 md:mx-auto relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-white",
        children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded-full ${getPinColor(event.type || "birth")}` }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: event.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Date" }),
        /* @__PURE__ */ jsx("p", { className: "text-white", children: formattedDate })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Type" }),
        /* @__PURE__ */ jsx("p", { className: "text-white capitalize", children: event.type?.replace("-", " ") })
      ] }),
      event.description && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Description" }),
        /* @__PURE__ */ jsx("p", { className: "text-white", children: event.description })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-end space-x-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-4 py-2 text-gray-400 hover:text-white transition-colors",
          children: "Close"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onUpdate,
          className: "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors",
          children: "Edit"
        }
      )
    ] })
  ] }) });
};

const EventFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialEvent }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    event_type_id: "",
    type: "",
    description: ""
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      fetchEventTypes();
    }
  }, [isOpen]);
  const fetchEventTypes = async () => {
    try {
      const response = await fetch("/api/event-types");
      if (!response.ok) {
        throw new Error("Failed to fetch event types");
      }
      const data = await response.json();
      setEventTypes(data);
      if (!formData.event_type_id && data.length > 0) {
        const birthType = data.find((type) => type.name === "birth");
        if (birthType) {
          setFormData((prev) => ({
            ...prev,
            event_type_id: birthType.id,
            type: birthType.name
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch event types:", error);
    }
  };
  useEffect(() => {
    if (initialEvent) {
      setFormData({
        name: initialEvent.name,
        date: initialEvent.date,
        event_type_id: initialEvent.event_type_id || "",
        type: initialEvent.type || "",
        description: initialEvent.description || ""
      });
    } else {
      setFormData({
        name: "",
        date: "",
        event_type_id: "",
        type: "",
        description: ""
      });
    }
  }, [initialEvent]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.event_type_id) {
      alert("Please select an event type");
      return;
    }
    try {
      setIsLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (initialEvent && onDelete) {
      try {
        setIsLoading(true);
        await onDelete(initialEvent.id);
        onClose();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-semibold mb-4", children: initialEvent ? "Update Event" : "Create New Event" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Date" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: formData.date?.split("T")[0],
            onChange: (e) => setFormData({ ...formData, date: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Type" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.event_type_id,
            onChange: (e) => {
              const selectedType = eventTypes.find((type) => type.id === e.target.value);
              setFormData({
                ...formData,
                event_type_id: e.target.value,
                type: selectedType?.name || ""
              });
            },
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select an event type" }),
              eventTypes.filter((type) => type.name !== "birth").map((type) => /* @__PURE__ */ jsx("option", { value: type.id, children: type.displayName }, type.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.description,
            onChange: (e) => setFormData({ ...formData, description: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            rows: 3
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50",
            children: isLoading ? "Saving..." : initialEvent ? "Update Event" : "Create Event"
          }
        ),
        initialEvent && onDelete && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleDelete,
            disabled: isLoading,
            className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50",
            children: "Delete Event"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            disabled: isLoading,
            className: "bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50",
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] }) });
};

const Timeline = ({
  events = [],
  setShowFormModal,
  showFormModal,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  error
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const birthEvent = events.find((item) => item.event_types?.name === "birth" || item.type === "birth");
  const birthDate = new Date(birthEvent?.date || "");
  const today = /* @__PURE__ */ new Date();
  const totalDays = Math.ceil((today.getTime() - birthDate.getTime()) / (1e3 * 60 * 60 * 24));
  const totalYears = Math.ceil(totalDays / 365);
  const eventsWithPosition = events.map((item) => {
    const eventDate = new Date(item.date);
    const daysSinceBirth = Math.ceil((eventDate.getTime() - birthDate.getTime()) / (1e3 * 60 * 60 * 24));
    const position = daysSinceBirth / totalDays * 100;
    return { ...item, position };
  });
  const handlePinClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  const handleUpdate = async (event) => {
    if (selectedEvent) {
      await handleUpdateEvent(selectedEvent.id, event);
      setShowUpdateForm(false);
      setShowModal(false);
      setSelectedEvent(null);
    }
  };
  const handleDelete = async (id) => {
    await handleDeleteEvent(id);
    setShowUpdateForm(false);
    setShowModal(false);
    setSelectedEvent(null);
  };
  const isBirthEvent = (event) => {
    return event.event_types?.name === "birth" || event.type === "birth";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "timeline-container flex flex-col h-auto", children: [
      /* @__PURE__ */ jsxs("div", { id: "timeline-line", className: "md:block bg-white h-1 flex flex-row relative hidden", children: [
        eventsWithPosition.map((item) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex flex-col h-auto absolute ${isBirthEvent(item) ? "-translate-y-2.5" : "-translate-y-full"}`,
            style: { left: `${item.position}%` },
            children: /* @__PURE__ */ jsx(Pin, { event: item, isBirth: isBirthEvent(item), handleClick: handlePinClick, orientation: "horizontal" })
          },
          item.id
        )),
        Array.from({ length: totalYears }).map((_, index) => {
          const year = birthDate.getFullYear() + index + 1;
          return /* @__PURE__ */ jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-0.5 h-4 bg-white absolute",
                style: { left: `${(index + 1) / totalYears * 100}%` }
              }
            ),
            index % 5 === 0 && /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute top-6 text-white text-xs bg-gray-900",
                style: {
                  left: `${(index + 1) / totalYears * 100}%`,
                  transform: "translateX(-50%)"
                },
                children: year
              }
            )
          ] }, year);
        })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: "mobile-timeline-line", className: "md:hidden w-1 bg-white flex flex-col relative h-[150vh] mx-10", children: [
        Array.from({ length: totalYears }).map((_, index) => {
          const year = birthDate.getFullYear() + index + 1;
          return /* @__PURE__ */ jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-1 w-2 bg-white absolute translate",
                style: { top: `${(index + 1) / totalYears * 100}%` }
              }
            ),
            index % 5 === 0 && /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute left-6 text-white text-xs bg-gray-900 ",
                style: {
                  top: `${(index + 1) / totalYears * 100}%`,
                  transform: "translateY(-50%) translateX(-210%)"
                },
                children: year
              }
            )
          ] }, year);
        }),
        eventsWithPosition.map((item) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex flex-row h-auto absolute ${isBirthEvent(item) ? "-translate-x-2.5" : "rotate-180"}`,
            style: { top: `${item.position}%` },
            children: /* @__PURE__ */ jsx(Pin, { event: item, isBirth: isBirthEvent(item), handleClick: handlePinClick, orientation: "vertical" })
          },
          item.id
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      EventModal,
      {
        event: selectedEvent,
        isOpen: showModal,
        onClose: () => {
          setShowModal(false);
          setSelectedEvent(null);
        },
        onUpdate: () => setShowUpdateForm(true)
      }
    ),
    /* @__PURE__ */ jsx(
      EventFormModal,
      {
        isOpen: showFormModal || showUpdateForm,
        onClose: () => {
          setShowFormModal(false);
          setShowUpdateForm(false);
          setSelectedEvent(null);
        },
        onSubmit: showUpdateForm ? handleUpdate : handleCreateEvent,
        onDelete: handleDelete,
        initialEvent: selectedEvent || void 0
      }
    )
  ] });
};

const TimelineFilters = ({ onFilterChange, onAddClick }) => {
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchEventTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/event-types");
      if (!response.ok) {
        throw new Error(`Failed to fetch event types: ${response.statusText}`);
      }
      const data = await response.json();
      setEventTypes(data);
      setSelectedTypeIds([]);
      onFilterChange([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch event types";
      logger.error("Failed to fetch event types", { error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchEventTypes();
  }, []);
  const handleTypeToggle = (typeId) => {
    const newSelectedTypeIds = selectedTypeIds.includes(typeId) ? [] : [typeId];
    setSelectedTypeIds(newSelectedTypeIds);
    onFilterChange(newSelectedTypeIds);
  };
  const handleRefresh = () => {
    fetchEventTypes();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4", children: /* @__PURE__ */ jsx("div", { className: "max-w-screen-xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-semibold", children: "Loading event types..." }),
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary" })
    ] }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4", children: /* @__PURE__ */ jsx("div", { className: "max-w-screen-xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-semibold", children: "Error loading event types" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm", children: error })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleRefresh,
          className: "bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors",
          children: "Retry"
        }
      )
    ] }) }) });
  }
  const defaultEventTypes = eventTypes.filter((type) => type.isDefault);
  const customEventTypes = eventTypes.filter((type) => !type.isDefault);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 transition-all duration-300 ease-in-out",
      style: {
        height: isExpanded ? "auto" : "4rem",
        overflow: "hidden"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "max-w-screen-xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-semibold", children: "Event Categories" }),
            selectedTypeIds.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm text-primary bg-primary/10 px-2 py-1 rounded", children: [
              "Showing only ",
              eventTypes.find((t) => t.id === selectedTypeIds[0])?.displayName
            ] }),
            selectedTypeIds.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded", children: "Showing all events" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setIsExpanded(!isExpanded),
                className: "text-gray-400 hover:text-white transition-colors",
                children: /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: `w-6 h-6 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`,
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onAddClick,
              className: "bg-primary hover:bg-white text-white hover:text-primary px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors",
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: "Add Event" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-2 md:grid-cols-4 gap-4 p-4 transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`, children: [
          defaultEventTypes.map((type) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => type.name !== "birth" && handleTypeToggle(type.id),
              className: `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${type.name === "birth" ? "bg-gray-600 text-gray-300 cursor-not-allowed" : selectedTypeIds.includes(type.id) ? "bg-primary text-white" : selectedTypeIds.length === 0 ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`,
              disabled: type.name === "birth",
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-4 h-4 rounded-full",
                    style: { backgroundColor: type.color }
                  }
                ),
                /* @__PURE__ */ jsx("span", { children: type.displayName }),
                type.name === "birth" && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "(Required)" }),
                selectedTypeIds.includes(type.id) && type.name !== "birth" && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300", children: "(Only)" })
              ]
            },
            type.id
          )),
          customEventTypes.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            customEventTypes.length > 0 && defaultEventTypes.length > 0 && /* @__PURE__ */ jsx("div", { className: "col-span-full border-t border-gray-700 my-2" }),
            customEventTypes.map((type) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleTypeToggle(type.id),
                className: `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${selectedTypeIds.includes(type.id) ? "bg-primary text-white" : selectedTypeIds.length === 0 ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`,
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-4 h-4 rounded-full",
                      style: { backgroundColor: type.color }
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { children: type.displayName }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "(Custom)" }),
                  selectedTypeIds.includes(type.id) && /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300", children: "(Only)" })
                ]
              },
              type.id
            ))
          ] })
        ] })
      ] })
    }
  );
};

const TimelineContainer = ({ events, sessionId }) => {
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [userEvents, setUserEvents] = useState(events);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const fetchEvents = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const { data, error: error2 } = await supabase.from("events").select(`
          *,
          event_types (
            id,
            name,
            display_name,
            color,
            icon
          )
        `).eq("user_id", sessionId).order("date", { ascending: true });
      if (error2) throw error2;
      setUserEvents(data || []);
      setError(null);
      console.log(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, [sessionId]);
  useEffect(() => {
    console.log("Updating filtered events");
    const filtered = userEvents.filter((event) => {
      if (event.event_types?.name === "birth" || event.type === "birth") {
        return true;
      }
      if (selectedTypeIds.length === 0) {
        return true;
      }
      return selectedTypeIds.includes(event.event_type_id);
    });
    setFilteredEvents(filtered);
  }, [selectedTypeIds, userEvents]);
  useEffect(() => {
    const heading = document.getElementById("timeline-heading");
    if (heading) {
      heading.textContent = selectedEventType ? selectedEventType.displayName : "Summary Page";
    }
  }, [selectedEventType]);
  const handleCreateEvent = async (event) => {
    try {
      setIsLoading(true);
      if (!sessionId) throw new Error("No authenticated user");
      const { data, error: error2 } = await supabase.from("events").insert([{ ...event, user_id: sessionId }]).select(`
          *,
          event_types (
            id,
            name,
            display_name,
            color,
            icon
          )
        `).single();
      if (error2) throw error2;
      await fetchEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      setError(err instanceof Error ? err.message : "Failed to create event");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateEvent = async (id, event) => {
    try {
      setIsLoading(true);
      if (!sessionId) throw new Error("No authenticated user");
      const { data, error: error2 } = await supabase.from("events").update(event).eq("id", id).eq("user_id", sessionId).select(`
          *,
          event_types (
            id,
            name,
            display_name,
            color,
            icon
          )
        `).single();
      if (error2) throw error2;
      await fetchEvents();
    } catch (err) {
      console.error("Failed to update event:", err);
      setError(err instanceof Error ? err.message : "Failed to update event");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteEvent = async (id) => {
    try {
      setIsLoading(true);
      if (!sessionId) throw new Error("No authenticated user");
      const { error: error2 } = await supabase.from("events").delete().eq("id", id).eq("user_id", sessionId);
      if (error2) throw error2;
      await fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      setError(err instanceof Error ? err.message : "Failed to delete event");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const hasBirthEvent = userEvents.some((event) => event.event_types?.name === "birth");
  const handleFilterChange = (selectedTypes) => {
    setSelectedTypeIds(selectedTypes);
    if (selectedTypes.length === 0) {
      setSelectedEventType(null);
    } else {
      const eventType = userEvents.find((event) => event.event_type_id === selectedTypes[0])?.event_types;
      if (eventType) {
        const selectedType = { id: selectedTypes[0], displayName: eventType.display_name };
        console.log(selectedType);
        setSelectedEventType(selectedType);
      }
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("div", { className: "text-white", children: "Loading..." }) });
  }
  if (!hasBirthEvent) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-white text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-2", children: "No Birth Event Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400", children: "Please add a birth event to start your timeline." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowFormModal(true),
          className: "bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90",
          children: "Add Birth Event"
        }
      ),
      /* @__PURE__ */ jsx(
        EventFormModal,
        {
          isOpen: showFormModal,
          onClose: () => setShowFormModal(false),
          onSubmit: handleCreateEvent,
          initialEvent: {
            event_type_id: "",
            // Will be set when user selects birth type
            name: "",
            date: "",
            description: ""
          }
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col justify-end relative align-center sm:mb-24 md:mb-0", children: /* @__PURE__ */ jsx("div", { className: "my-auto", children: /* @__PURE__ */ jsx(
      Timeline,
      {
        events: filteredEvents,
        setShowFormModal,
        showFormModal,
        handleCreateEvent,
        handleUpdateEvent,
        handleDeleteEvent,
        error,
        isLoading
      }
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col justify-end relative", children: [
      /* @__PURE__ */ jsx(
        TimelineFilters,
        {
          onFilterChange: handleFilterChange,
          onAddClick: () => setShowFormModal(true)
        }
      ),
      /* @__PURE__ */ jsx(
        EventFormModal,
        {
          isOpen: showFormModal,
          onClose: () => setShowFormModal(false),
          onSubmit: handleCreateEvent
        }
      )
    ] })
  ] });
};

const $$Astro = createAstro();
const $$Summary = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Summary;
  const accessToken = Astro2.cookies.get("sb-access-token");
  const refreshToken = Astro2.cookies.get("sb-refresh-token");
  let session = null;
  if (accessToken && refreshToken) {
    try {
      const result = await supabase.auth.setSession({
        refresh_token: refreshToken.value,
        access_token: accessToken.value
      });
      if (!result.error) {
        session = result.data.session;
      }
    } catch (error) {
    }
  }
  if (!session) {
    return Astro2.redirect("/signin");
  }
  const { data: events } = await supabase.from("events").select("*").eq("user_id", session.user.id).order("date", { ascending: true });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <h1 id="timeline-heading" class="text-4xl font-bold text-white mb-8">
Summary Page
</h1> <div class="w-full min-h-[45vh] rounded-lg flex flex-col justify-end items-center relative pb-18"> ${renderComponent($$result2, "TimelineContainer", TimelineContainer, { "client:load": true, "events": events || [], "sessionId": session.user.id, "client:component-hydration": "load", "client:component-path": "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/components/TimelineContainer", "client:component-export": "default" })} </div> </div> ` })}`;
}, "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/summary.astro", void 0);

const $$file = "/Users/alexanderdollard/Development/timeline/storming-spectrum/src/pages/summary.astro";
const $$url = "/summary";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Summary,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
