import { Issue, IssueType, IssueStatus } from '../types';

// Mock issues data for demonstration - Scottish locations
export const mockIssues: Issue[] = [
  {
    id: '1',
    type: 'pothole',
    title: 'Large pothole on High Street',
    description: 'Deep pothole causing damage to vehicles. Approximately 30cm wide and 10cm deep.',
    location: {
      lat: 55.9533,
      lng: -3.1883,
      address: 'High Street, Edinburgh EH1'
    },
    status: 'reported',
    priority: 8,
    reportedBy: 'John Smith',
    reportedAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
    votes: 15
  },
  {
    id: '2',
    type: 'streetlight',
    title: 'Broken streetlight on Princes Street',
    description: 'Streetlight has been out for 3 days, making the area unsafe at night.',
    location: {
      lat: 55.9520,
      lng: -3.1964,
      address: 'Princes Street, Edinburgh EH2'
    },
    status: 'under_review',
    priority: 7,
    reportedBy: 'Mary Johnson',
    reportedAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-12'),
    votes: 12
  },
  {
    id: '3',
    type: 'litter',
    title: 'Overflowing bins at Meadows Park',
    description: 'Multiple bins overflowing, attracting vermin.',
    location: {
      lat: 55.9411,
      lng: -3.1900,
      address: 'The Meadows, Edinburgh EH9'
    },
    status: 'in_progress',
    priority: 6,
    reportedBy: 'David Wilson',
    reportedAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-13'),
    councilNotes: 'Scheduled for collection tomorrow.',
    votes: 8
  },
  {
    id: '4',
    type: 'flooding',
    title: 'Blocked drain causing flooding',
    description: 'Water pooling on road after rain, blocking drain needs clearing.',
    location: {
      lat: 55.9485,
      lng: -3.2001,
      address: 'Lothian Road, Edinburgh EH3'
    },
    status: 'reported',
    priority: 9,
    reportedBy: 'Sarah Brown',
    reportedAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14'),
    votes: 23
  },
  {
    id: '5',
    type: 'graffiti',
    title: 'Graffiti on community centre wall',
    description: 'Offensive graffiti on the side of the building.',
    location: {
      lat: 55.9575,
      lng: -3.1947,
      address: 'Leith Walk, Edinburgh EH6'
    },
    status: 'resolved',
    priority: 5,
    reportedBy: 'James Taylor',
    reportedAt: new Date('2025-12-28'),
    updatedAt: new Date('2026-01-09'),
    resolvedAt: new Date('2026-01-09'),
    councilNotes: 'Cleaned by maintenance team.',
    votes: 6
  },
  {
    id: '6',
    type: 'broken_pavement',
    title: 'Cracked pavement - trip hazard',
    description: 'Large crack in pavement creating a trip hazard for pedestrians.',
    location: {
      lat: 55.9440,
      lng: -3.1850,
      address: 'South Clerk Street, Edinburgh EH8'
    },
    status: 'under_review',
    priority: 7,
    reportedBy: 'Emma Davis',
    reportedAt: new Date('2026-01-11'),
    updatedAt: new Date('2026-01-13'),
    votes: 10
  },
  {
    id: '7',
    type: 'abandoned_vehicle',
    title: 'Abandoned car on residential street',
    description: 'Car has been parked for over 2 weeks, appears abandoned.',
    location: {
      lat: 55.9615,
      lng: -3.2054,
      address: 'Great Junction Street, Edinburgh EH6'
    },
    status: 'reported',
    priority: 4,
    reportedBy: 'Robert Anderson',
    reportedAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
    votes: 5
  },
  {
    id: '8',
    type: 'pothole',
    title: 'Multiple potholes on residential road',
    description: 'Several potholes along the street, getting worse with rain.',
    location: {
      lat: 55.9387,
      lng: -3.2087,
      address: 'Morningside Road, Edinburgh EH10'
    },
    status: 'in_progress',
    priority: 8,
    reportedBy: 'Linda White',
    reportedAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-01-14'),
    councilNotes: 'Road repair crew scheduled for next week.',
    votes: 18
  }
];

export const issueTypeLabels: Record<IssueType, string> = {
  pothole: 'Pothole',
  litter: 'Litter/Bins',
  streetlight: 'Streetlight',
  flooding: 'Flooding/Drainage',
  graffiti: 'Graffiti',
  abandoned_vehicle: 'Abandoned Vehicle',
  broken_pavement: 'Broken Pavement',
  other: 'Other'
};

export const issueTypeColors: Record<IssueType, string> = {
  pothole: '#ef4444',
  litter: '#f59e0b',
  streetlight: '#eab308',
  flooding: '#3b82f6',
  graffiti: '#8b5cf6',
  abandoned_vehicle: '#6366f1',
  broken_pavement: '#ec4899',
  other: '#6b7280'
};

export const statusLabels: Record<IssueStatus, string> = {
  reported: 'Reported',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const statusColors: Record<IssueStatus, string> = {
  reported: 'bg-red-100 text-red-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};
