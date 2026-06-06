// Centralized navigation configuration for all dashboard pages
// Import icons as needed in components

export const getPrimaryNavItems = (activePageId = null) => [
  { id: "homepage", label: "Overview", icon: "Home" },
  { id: "plans", label: "Plans", icon: "FolderOpen" },
  { id: "plot", label: "Plot", icon: "BarChart3" },
  { id: "community", label: "Community", icon: "Users" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
];

export const getAccountNavItems = () => [
  { id: "settings", label: "Settings", icon: "Settings" },
];
