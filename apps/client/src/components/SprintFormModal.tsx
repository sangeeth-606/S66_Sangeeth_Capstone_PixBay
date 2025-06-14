import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarIcon } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import api from "../utils/api";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { cn } from "../lib/utils";

interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
}

interface SprintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  workspaceName: string;
  onSprintCreated?: () => void;
}

export function SprintFormModal({
  isOpen,
  onClose,
  darkMode = true,
  workspaceName,
  onSprintCreated,
}: SprintFormModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectsError, setProjectsError] = useState("");

  const { getToken } = useAuth();

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen && workspaceName) {
      const fetchProjects = async () => {
        try {
          const token = await getToken();
          const response = await axios.get(
            api.getApiEndpoint(`/api/projects/workspace/${workspaceName}`),
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setProjects(response.data);
        } catch (err: Error | unknown) {
          setProjectsError("Failed to fetch projects");
          console.error("Error fetching projects:", err);
        }
      };
      fetchProjects();
    }
  }, [isOpen, workspaceName, getToken]);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setSelectedProjectId("");
      setError("");
      setProjectsError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      setError("Please select a project");
      return;
    }

    if (!name) {
      setError("Sprint name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = await getToken();
      await axios.post(
        api.getApiEndpoint("/api/sprints/create"),
        {
          name,
          goal,
          startDate: startDate || null,
          endDate: endDate || null,
          projectId: selectedProjectId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      onClose();
      if (onSprintCreated) {
        onSprintCreated();
      }
    } catch (err: Error | unknown) {
      // Cast to axios error response
      type ErrorWithResponse = { response?: { data?: { error?: string } } };
      const errorResponse = (err as ErrorWithResponse).response;
      setError(errorResponse?.data?.error || "Failed to create sprint");
      console.error("Error creating sprint:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(format(date, "yyyy-MM-dd"));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(format(date, "yyyy-MM-dd"));
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: { duration: 0.15, ease: "easeOut" },
    },
  };

  const inputStyles = `w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
    darkMode
      ? "bg-[#171717] border-[#2C2C2C] text-white"
      : "bg-white border-gray-200 text-[#212121]"
  }`;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/30"
            onClick={onClose}
          ></div>
          <motion.div
            className={`relative w-full max-w-md transform ${
              darkMode
                ? "bg-[#171717]/95 border border-[#2C2C2C]"
                : "bg-gray-100/95"
            } rounded-lg shadow-xl backdrop-blur-sm`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              delay: 0.05,
            }}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-[#212121]"
                  }`}
                >
                  Create New Sprint
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full hover:bg-opacity-80 ${
                    darkMode
                      ? "text-gray-400 hover:bg-[#2C2C2C]"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className={`block mb-2 font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Sprint Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputStyles}
                    placeholder="Enter sprint name"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block mb-2 font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Project <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className={inputStyles}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block mb-2 font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Sprint Goal
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={inputStyles}
                    placeholder="What's the goal of this sprint?"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left",
                            !startDate && "text-gray-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(new Date(startDate), "PPP")
                            : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate ? new Date(startDate) : undefined}
                          onSelect={handleStartDateChange}
                          initialFocus
                          required={false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label
                      className={`block mb-2 font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      End Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left",
                            !endDate && "text-gray-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? format(new Date(endDate), "PPP")
                            : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate ? new Date(endDate) : undefined}
                          onSelect={handleEndDateChange}
                          initialFocus
                          required={false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                {projectsError && (
                  <div className="text-red-500 text-sm">{projectsError}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-white font-medium transition-colors duration-200 flex items-center justify-center relative overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="ml-1">Creating...</span>
                      </span>
                      <span className="opacity-0">Create Sprint</span>
                    </>
                  ) : (
                    "Create Sprint"
                  )}
                  {isLoading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-700/40 to-emerald-600/40 animate-pulse rounded-lg"></span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
