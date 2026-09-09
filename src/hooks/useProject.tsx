import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectData, mockProjectData, projectsList } from '../data/mockData';

interface ProjectContextType {
  currentProjectName: string;
  projectData: ProjectData;
  changeProject: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshData: () => void;
  isRefreshing: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [currentProjectName, setCurrentProjectName] = useState<string>(projectsList[0]);
  const [projectData, setProjectData] = useState<ProjectData>(mockProjectData[projectsList[0]]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Sync project data when project changes
  const changeProject = (name: string) => {
    if (mockProjectData[name]) {
      setCurrentProjectName(name);
      setProjectData(JSON.parse(JSON.stringify(mockProjectData[name])));
    }
  };

  // Simulate refresh, modifying some metrics randomly for visual feedback
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setProjectData(prev => {
        const next = { ...prev };
        
        // Randomly tweak values slightly
        const workerDiff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        next.activeWorkers = Math.max(10, prev.activeWorkers + workerDiff);
        
        const safetyDiff = Math.floor(Math.random() * 3) - 1; // -1 to +1
        next.safetyScore = Math.min(100, Math.max(50, prev.safetyScore + safetyDiff));
        
        const utilizationDiff = Math.floor(Math.random() * 5) - 2;
        next.equipmentUtilization = Math.min(100, Math.max(30, prev.equipmentUtilization + utilizationDiff));
        
        // Let's add a log change or similar
        return next;
      });
      setIsRefreshing(false);
    }, 800);
  };

  // Dark Mode side effects
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ProjectContext.Provider
      value={{
        currentProjectName,
        projectData,
        changeProject,
        searchQuery,
        setSearchQuery,
        refreshData,
        isRefreshing,
        darkMode,
        toggleDarkMode
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
