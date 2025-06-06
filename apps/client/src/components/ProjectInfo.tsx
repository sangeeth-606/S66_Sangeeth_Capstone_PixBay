import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { getApiEndpoint } from "../utils/api"; // Import the API utility function

interface ProjectInfo {
  name: string;
  description: string;
  status: string;
  progress: number;
  deadline?: string; // Optional since it might not be in the API
  teamMembers?: number; // This will now contain the workspace member count
}

interface ProjectInfoProps {
  darkMode: boolean;
  projectId?: string | null; // Add projectId as a prop
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({ darkMode, projectId }) => {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchProjectInfo = useCallback(async () => {
    if (!projectId) {
      setError("Select a project or create a new one");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const projectUrl = getApiEndpoint(`api/projects/${projectId}`);

      const response = await axios.get(projectUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectData = {
        ...response.data,
        status: response.data.status || "active",
        progress: response.data.progress || 0,
      };

      setProject(projectData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching project:", err);

      let errorMessage = "Failed to load project information";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          err.response.status === 404
            ? "Project not found"
            : `Error: ${err.response.status} - ${err.response.statusText}`;
      }

      setError(errorMessage);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken]);

  useEffect(() => {
    fetchProjectInfo();
  }, [fetchProjectInfo, projectId]);

  if (loading) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 ${
          darkMode ? "bg-[#171717] border border-[#2C2C2C]" : "bg-gray-100"
        }`}
      >
        <p
          className={`text-center ${darkMode ? "text-white" : "text-[#212121]"}`}
        >
          Loading project information...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 ${
          darkMode ? "bg-[#171717] border border-[#2C2C2C]" : "bg-gray-100"
        }`}
      >
        <p className={`text-center text-red-500`}>
          {error || "Project not found"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-md ${
        darkMode ? "bg-[#171717] border border-[#2C2C2C]" : "bg-gray-100"
      }`}
    >
      <div className="p-5">
        <h1
          className={`text-xl font-bold mb-3 ${
            darkMode ? "text-white" : "text-[#212121]"
          }`}
        >
          {project.name}
        </h1>

        {project.description && (
          <div
            className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <p className="text-sm">{project.description}</p>
          </div>
        )}

        <div className="flex justify-between items-center px-6">
          <div className="flex items-center">
            <div className="relative w-12 h-12">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  darkMode ? "border-[#2C2C2C]" : "border-gray-300"
                }`}
              >
                <div className="text-emerald-400 font-semibold text-sm">
                  {project.progress}%
                </div>
              </div>
              <svg
                className="absolute top-0 left-0 w-12 h-12"
                viewBox="0 0 44 44"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke={darkMode ? "#2c2c2c" : "#e5e5e5"}
                  strokeWidth="4"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${(project.progress / 100) * 113} 113`}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Progress
              </div>
              <div
                className={`${darkMode ? "text-white" : "text-[#212121]"} text-sm`}
              >
                {project.progress}%
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? "bg-[#2C2C2C]" : "bg-gray-200"
              }`}
            >
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Status
              </div>
              <div
                className={`${darkMode ? "text-white" : "text-[#212121]"} text-sm capitalize`}
              >
                {project.status}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? "bg-[#2C2C2C]" : "bg-gray-200"
              }`}
            >
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Team
              </div>
              <div
                className={`${darkMode ? "text-white" : "text-[#212121]"} text-sm`}
              >
                {project.teamMembers || 0} members
              </div>
            </div>
          </div>

          {project.deadline && (
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-[#2C2C2C]" : "bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Deadline
                </div>
                <div
                  className={`${darkMode ? "text-white" : "text-[#212121]"} text-sm`}
                >
                  {project.deadline}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
