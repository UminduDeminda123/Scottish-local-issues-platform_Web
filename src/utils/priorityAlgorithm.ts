import { Issue } from '../types';

/**
 * Calculate priority score for an issue
 * Priority is calculated based on multiple factors:
 * - Issue type severity (1-10)
 * - Community votes (weighted)
 * - Age of issue (older = higher priority)
 * - Status (reported issues get higher priority)
 */
export function calculatePriority(issue: Issue): number {
  // Base severity by type
  const typeSeverity: Record<string, number> = {
    flooding: 9,
    pothole: 8,
    broken_pavement: 7,
    streetlight: 7,
    abandoned_vehicle: 5,
    litter: 4,
    graffiti: 4,
    other: 5
  };

  const baseSeverity = typeSeverity[issue.type] || 5;
  
  // Vote weight (normalized, max 2 points)
  const voteWeight = Math.min(issue.votes / 10, 2);
  
  // Age weight (1 point per week, max 2 points)
  const ageInDays = Math.floor(
    (new Date().getTime() - new Date(issue.reportedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const ageWeight = Math.min(ageInDays / 7, 2);
  
  // Status weight (urgent if just reported)
  const statusWeight = issue.status === 'reported' ? 1 : 0;
  
  // Calculate final priority (1-10 scale)
  const rawPriority = baseSeverity + voteWeight + ageWeight + statusWeight;
  return Math.min(Math.round(rawPriority), 10);
}

/**
 * Sort issues by priority (highest first)
 */
export function sortByPriority(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => b.priority - a.priority);
}

/**
 * Filter issues by various criteria
 */
export function filterIssues(
  issues: Issue[],
  filters: {
    types?: string[];
    statuses?: string[];
    minPriority?: number;
    searchTerm?: string;
  }
): Issue[] {
  return issues.filter(issue => {
    if (filters.types && filters.types.length > 0 && !filters.types.includes(issue.type)) {
      return false;
    }
    
    if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) {
      return false;
    }
    
    if (filters.minPriority && issue.priority < filters.minPriority) {
      return false;
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return (
        issue.title.toLowerCase().includes(term) ||
        issue.description.toLowerCase().includes(term) ||
        issue.location.address.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
}

/**
 * Get priority label and color
 */
export function getPriorityInfo(priority: number): { label: string; color: string } {
  if (priority >= 8) {
    return { label: 'Critical', color: 'bg-red-500' };
  } else if (priority >= 6) {
    return { label: 'High', color: 'bg-orange-500' };
  } else if (priority >= 4) {
    return { label: 'Medium', color: 'bg-yellow-500' };
  } else {
    return { label: 'Low', color: 'bg-green-500' };
  }
}
