import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_cefmmz3r.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_D9xI5dYe.mjs';
import { s as supabase } from '../chunks/supabase_riZVRtFr.mjs';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import React, { useState, useMemo, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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

const Pin = ({ event, isBirth = false, handleClick, isMobile, index }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedDate = useMemo(() => {
    return new Date(event.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, [event.date]);
  useGSAP(() => {
    if (process.env.NODE_ENV === "development") ;
    if (!isMobile) {
      gsap.to(".shaft", {
        height: 90,
        width: 0.5,
        duration: 0.2,
        stagger: 0.1,
        ease: "power2.inOut"
      });
    } else {
      gsap.to(".shaft", {
        height: 0.5,
        width: 90,
        duration: 0.2,
        stagger: 0.1,
        ease: "power2.inOut"
      });
    }
  }, [isMobile, event]);
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    }
    return getPinColor(event.type || "birth");
  };
  const tooltipClasses = !isMobile ? "absolute md:-translate-x-1/2 md:-top-16 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap" : "absolute rotate-180 -translate-x-32 bg-gray-900 border border-gray-700 shadow-lg text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap";
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
            className: "event rounded-full transition-all duration-200 absolute h-6 w-6 cursor-pointer",
            style: {
              backgroundColor: getEventColor(),
              left: !isMobile ? "50%" : void 0,
              top: isMobile ? "50%" : void 0,
              transform: !isMobile ? "translateX(-50%) scale(1)" : isMobile ? "translateY(-50%) scale(1)" : "scale(1)",
              transformOrigin: "center"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = !isMobile ? "translateX(-50%) scale(1.5)" : isMobile ? "translateY(-50%) scale(1.5)" : "scale(1.5)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = !isMobile ? "translateX(-50%) scale(1)" : isMobile ? "translateY(-50%) scale(1)" : "scale(1)";
            },
            onClick: () => handleClick(event)
          }
        ),
        showTooltip && /* @__PURE__ */ jsxs(
          "div",
          {
            className: `${tooltipClasses} ${index !== 0 && index % 2 === 0 ? "rotate-180 origin-bottom -translate-y-full" : ""}`,
            style: { pointerEvents: "none" },
            children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: event.name }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-300", children: formattedDate })
            ]
          }
        ),
        !isBirth && /* @__PURE__ */ jsx("div", { className: `shaft ${!isMobile ? "h-0 w-0.5 bg-white mx-auto" : "w-20 h-0.5 bg-white my-auto"}` })
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
  const getEventColor = () => {
    if (event.event_types?.color) {
      return event.event_types.color;
    } else {
      return "#f2f2f2";
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 md:mx-auto relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-white",
        children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded-full`, style: { backgroundColor: getEventColor() } }),
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

const CreateEventTypeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    color: "#3B82F6",
    icon: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const predefinedColors = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
    "#F43F5E",
    "#6B7280",
    "#374151",
    "#1F2937"
  ];
  const predefinedIcons = [
    "star",
    "heart",
    "trophy",
    "gift",
    "cake",
    "music",
    "camera",
    "book",
    "gamepad",
    "car",
    "home",
    "briefcase",
    "graduation-cap",
    "plane",
    "ship",
    "bicycle",
    "football",
    "basketball",
    "swimming",
    "paint-brush",
    "code",
    "wrench",
    "lightbulb",
    "fire",
    "leaf"
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const name = formData.name || formData.displayName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const response = await fetch("/api/event-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          name
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event type");
      }
      const newEventType = await response.json();
      onSuccess(newEventType);
      onClose();
      setFormData({
        name: "",
        displayName: "",
        color: "#3B82F6",
        icon: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event type");
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError(null);
      setFormData({
        name: "",
        displayName: "",
        color: "#3B82F6",
        icon: ""
      });
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-semibold mb-4", children: "Create Custom Event Type" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Display Name *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.displayName,
            onChange: (e) => setFormData({ ...formData, displayName: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            placeholder: "e.g., Graduation, Wedding, Promotion",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Internal Name (optional)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            placeholder: "Auto-generated from display name if empty"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Used internally. Leave empty to auto-generate from display name." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Color *" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "color",
              value: formData.color,
              onChange: (e) => setFormData({ ...formData, color: e.target.value }),
              className: "w-12 h-10 rounded border border-gray-600"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.color,
              onChange: (e) => setFormData({ ...formData, color: e.target.value }),
              className: "flex-1 bg-gray-700 text-white rounded px-3 py-2",
              placeholder: "#3B82F6"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-10 gap-1 mt-2", children: predefinedColors.map((color) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setFormData({ ...formData, color }),
            className: "w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform",
            style: { backgroundColor: color },
            title: color
          },
          color
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white mb-1", children: "Icon (optional)" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.icon,
            onChange: (e) => setFormData({ ...formData, icon: e.target.value }),
            className: "w-full bg-gray-700 text-white rounded px-3 py-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "No icon" }),
              predefinedIcons.map((icon) => /* @__PURE__ */ jsx("option", { value: icon, children: icon.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) }, icon))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleClose,
            disabled: isLoading,
            className: "bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading || !formData.displayName,
            className: "bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50",
            children: isLoading ? "Creating..." : "Create Event Type"
          }
        )
      ] })
    ] })
  ] }) });
};

const EventFormModal = ({ isOpen, onClose, onSubmit, onDelete, initialEvent, eventTypes, onRefreshEventTypes }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    event_type_id: "",
    type: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateEventTypeModal, setShowCreateEventTypeModal] = useState(false);
  useEffect(() => {
    if (isOpen && !formData.event_type_id && eventTypes.length > 0) {
      const birthType = eventTypes.find((type) => type.name === "birth");
      if (birthType) {
        setFormData((prev) => ({
          ...prev,
          event_type_id: birthType.id,
          type: birthType.name
        }));
      }
    }
  }, [isOpen, eventTypes]);
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
  const handleCreateEventTypeSuccess = (newEventType) => {
    setFormData((prev) => ({
      ...prev,
      event_type_id: newEventType.id,
      type: newEventType.name
    }));
    if (onRefreshEventTypes) {
      onRefreshEventTypes();
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 p-6 rounded-lg w-full max-w-md", children: [
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
                if (e.target.value === "create-custom") {
                  setShowCreateEventTypeModal(true);
                  return;
                }
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
                eventTypes.filter((type) => type.name !== "birth").map((type) => /* @__PURE__ */ jsx("option", { value: type.id, children: type.displayName }, type.id)),
                /* @__PURE__ */ jsx("option", { value: "create-custom", className: "text-primary font-semibold", children: "+ Create Custom Event Type" })
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
    ] }),
    /* @__PURE__ */ jsx(
      CreateEventTypeModal,
      {
        isOpen: showCreateEventTypeModal,
        onClose: () => setShowCreateEventTypeModal(false),
        onSuccess: handleCreateEventTypeSuccess
      }
    )
  ] });
};

const Timeline = ({
  events = [],
  eventTypes,
  setShowFormModal,
  showFormModal,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  onRefreshEventTypes,
  error
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (process.env.NODE_ENV === "development") {
        console.log("Screen size detected:", mobile ? "mobile" : "desktop", "width:", window.innerWidth);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const birthEvent = useMemo(() => {
    return events.find((item) => item.event_types?.name === "birth" || item.type === "birth");
  }, [events]);
  const birthDate = useMemo(() => {
    return new Date(birthEvent?.date || "");
  }, [birthEvent?.date]);
  const totalDays = useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    return Math.ceil((today.getTime() - birthDate.getTime()) / (1e3 * 60 * 60 * 24));
  }, [birthDate]);
  const totalYears = useMemo(() => {
    return Math.ceil(totalDays / 365);
  }, [totalDays]);
  const eventsWithPosition = useMemo(() => {
    return events.map((item) => {
      const eventDate = new Date(item.date);
      const daysSinceBirth = Math.ceil((eventDate.getTime() - birthDate.getTime()) / (1e3 * 60 * 60 * 24));
      const position = daysSinceBirth / totalDays * 100;
      return { ...item, position };
    });
  }, [events, birthDate, totalDays]);
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
  const isBirthEvent = useMemo(() => {
    return (event) => {
      return event.event_types?.name === "birth" || event.type === "birth";
    };
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "timeline-container flex flex-col h-auto", children: [
      !isMobile && /* @__PURE__ */ jsxs("div", { id: "timeline-line", className: "bg-white h-1 flex flex-row relative", children: [
        eventsWithPosition.map((item, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex flex-col h-auto absolute ${isBirthEvent(item) ? "-translate-y-2.5" : "-translate-y-full"}
                ${index !== 0 && index % 2 === 0 ? "rotate-180 origin-bottom" : ""}`,
            style: { left: `${item.position}%` },
            children: /* @__PURE__ */ jsx(Pin, { event: item, isBirth: isBirthEvent(item), handleClick: handlePinClick, isMobile: false, index })
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
      isMobile && /* @__PURE__ */ jsxs("div", { className: "w-1 bg-white flex flex-col relative h-[150vh] mx-10", children: [
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
        eventsWithPosition.map((item, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex flex-row h-auto absolute ${isBirthEvent(item) ? "-translate-x-2.5" : "rotate-180"}`,
            style: { top: `${item.position}%` },
            children: /* @__PURE__ */ jsx(Pin, { event: item, isBirth: isBirthEvent(item), handleClick: handlePinClick, isMobile: true, index })
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
        initialEvent: selectedEvent || void 0,
        eventTypes,
        onRefreshEventTypes
      }
    )
  ] });
};

const TimelineFilters = ({ eventTypes, onFilterChange, onAddClick }) => {
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  useEffect(() => {
    if (eventTypes.length > 0) {
      setSelectedTypeIds([]);
      onFilterChange([]);
    }
  }, [eventTypes]);
  const handleTypeToggle = (typeId) => {
    console.log("handleTypeToggle", typeId);
    const newSelectedTypeIds = selectedTypeIds.includes(typeId) ? [] : [typeId];
    setSelectedTypeIds(newSelectedTypeIds);
    onFilterChange(newSelectedTypeIds);
  };
  const birthEvent = eventTypes.find((type) => type.name === "birth");
  const otherDefaultEvents = eventTypes.filter((type) => type.isDefault && type.name !== "birth");
  const customEventTypes = eventTypes.filter((type) => !type.isDefault);
  const defaultEventTypes = birthEvent ? [birthEvent, ...otherDefaultEvents] : otherDefaultEvents;
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
              className: "bg-gradient-to-b from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors",
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
  console.log("🔍 Initial events passed to TimelineContainer:", events);
  console.log("🔍 sessionId passed to TimelineContainer:", sessionId);
  const [selectedTypeIds, setSelectedTypeIds] = useState([]);
  const [userEvents, setUserEvents] = useState(events);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Using sessionId from props:", sessionId);
      if (!sessionId) {
        throw new Error("No user ID available");
      }
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
      console.log("🔍 Events query result:", { data, error: error2 });
      if (error2) throw error2;
      const response = await fetch("/api/event-types");
      if (!response.ok) {
        throw new Error(`Failed to fetch event types: ${response.statusText}`);
      }
      const eventTypesData = await response.json();
      setUserEvents(data || []);
      setEventTypes(eventTypesData || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (sessionId) {
      fetchEvents();
    }
  }, [sessionId]);
  const filteredEvents = useMemo(() => {
    return userEvents.filter((event) => {
      if (event.event_types?.name === "birth" || event.type === "birth") {
        return true;
      }
      if (selectedTypeIds.length === 0) {
        return true;
      }
      return selectedTypeIds.includes(event.event_type_id);
    });
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
      if (!sessionId) throw new Error("No user ID available");
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
      if (!sessionId) throw new Error("No user ID available");
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
      if (!sessionId) throw new Error("No user ID available");
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
      const eventType = eventTypes.find((eventType2) => eventType2.id === selectedTypes[0]);
      if (eventType) {
        const selectedType = { id: selectedTypes[0], displayName: eventType.displayName };
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
          },
          eventTypes,
          onRefreshEventTypes: fetchEvents
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col justify-center relative align-center sm:mb-24 md:mb-0", children: /* @__PURE__ */ jsx("div", { className: "mb-36", children: /* @__PURE__ */ jsx(
      Timeline,
      {
        events: filteredEvents,
        eventTypes,
        setShowFormModal,
        showFormModal,
        handleCreateEvent,
        handleUpdateEvent,
        handleDeleteEvent,
        onRefreshEventTypes: fetchEvents,
        error,
        isLoading
      }
    ) }) }),
    /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col justify-end relative", children: /* @__PURE__ */ jsx(
      TimelineFilters,
      {
        eventTypes,
        onFilterChange: handleFilterChange,
        onAddClick: () => setShowFormModal(true)
      }
    ) })
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
  const { data: events } = await supabase.from("events").select(
    `
    *,
    event_types (
      id,
      name,
      display_name,
      color,
      icon
    )
  `
  ).eq("user_id", session.user.id).order("date", { ascending: true });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8"> <h1 id="timeline-heading" class="text-4xl font-bold text-white mx-auto text-center">
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
