export type IssueType =
  | 'pothole'
  | 'litter'
  | 'streetlight'
  | 'flooding'
  | 'graffiti'
  | 'abandoned_vehicle'
  | 'broken_pavement'
  | 'other';

export type IssueStatus =
  | 'reported'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type UserRole = 'citizen' | 'council' | 'admin';

export interface Issue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: IssueStatus;
  priority: number;
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  imageUrl?: string;
  councilNotes?: string;
  votes: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  council?: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  council?: string;
  createdAt?: string;
}

export interface AnalyticsData {
  issuesByType: Record<IssueType, number>;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByMonth: Array<{ month: string; count: number }>;
  avgResolutionTime: number;
  topAreas: Array<{ area: string; count: number }>;
}
