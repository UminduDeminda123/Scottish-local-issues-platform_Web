import { Issue, IssueStatus, ManagedUser, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'slip_auth_token';

interface ApiIssue {
  id: string;
  type: Issue['type'];
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
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  imageUrl?: string | null;
  councilNotes?: string | null;
  votes: number;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
}

function normalizeIssue(issue: ApiIssue): Issue {
  return {
    ...issue,
    reportedAt: new Date(issue.reportedAt),
    updatedAt: new Date(issue.updatedAt),
    resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : undefined,
    imageUrl: issue.imageUrl || undefined,
    councilNotes: issue.councilNotes || undefined,
  };
}

export const api = {
  getToken,
  clearToken,
  async signup(payload: { email: string; password: string; name: string }) {
    return request<{ message: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async login(payload: { email: string; password: string }) {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(data.token);
    return data;
  },
  async getCurrentUser() {
    return request<{ user: User }>('/auth/me');
  },
  async getIssues() {
    const data = await request<{ issues: ApiIssue[] }>('/issues');
    return data.issues.map(normalizeIssue);
  },
  async createIssue(payload: Omit<Issue, 'id' | 'reportedAt' | 'updatedAt' | 'priority' | 'votes'>) {
    const data = await request<{ issue: ApiIssue }>('/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeIssue(data.issue);
  },
  async voteIssue(issueId: string) {
    const data = await request<{ issue: ApiIssue }>(`/issues/${issueId}/vote`, {
      method: 'POST',
    });
    return normalizeIssue(data.issue);
  },
  async updateIssueStatus(issueId: string, status: IssueStatus, councilNotes?: string) {
    const data = await request<{ issue: ApiIssue }>(`/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, councilNotes }),
    });
    return normalizeIssue(data.issue);
  },
  async getAdminUsers() {
    return request<{ users: ManagedUser[] }>('/admin/users');
  },
  async createAdminUser(payload: {
    name: string;
    email: string;
    password: string;
    role: 'council' | 'admin';
    council?: string;
  }) {
    return request<{ message: string; user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
