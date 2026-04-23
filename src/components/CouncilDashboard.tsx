import { useState } from 'react';
import { Issue, IssueStatus, User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SimpleMap } from './SimpleMap';
import { IssueList } from './IssueList';
import { IssueDetailsDialog } from './IssueDetailsDialog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminUserPanel } from './AdminUserPanel';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, LogOut, BarChart3, MapIcon, List, AlertTriangle, Users } from 'lucide-react';
import { issueTypeLabels, statusLabels } from '../data/mockData';
import { filterIssues, sortByPriority } from '../utils/priorityAlgorithm';

interface CouncilDashboardProps {
  user: User;
  issues: Issue[];
  onUpdateIssue: (issueId: string, status: IssueStatus, notes?: string) => void;
  onLogout: () => void;
}

export function CouncilDashboard({ user, issues, onUpdateIssue, onLogout }: CouncilDashboardProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [minPriority, setMinPriority] = useState<string>('all');

  const filteredIssues = filterIssues(issues, {
    types: filterType !== 'all' ? [filterType] : undefined,
    statuses: filterStatus !== 'all' ? [filterStatus] : undefined,
    minPriority: minPriority !== 'all' ? parseInt(minPriority, 10) : undefined,
    searchTerm: searchTerm || undefined
  });

  const sortedIssues = sortByPriority(filteredIssues);
  const priorityIssues = issues.filter((issue) => issue.priority >= 8 && issue.status !== 'resolved' && issue.status !== 'closed');
  const isAdmin = user.role === 'admin';

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailsDialogOpen(true);
  };

  const handleStatusChange = (issueId: string, status: IssueStatus, notes?: string) => {
    onUpdateIssue(issueId, status, notes);
    setDetailsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Admin & Council Portal' : 'Council Management Portal'}</h1>
              <p className="text-sm text-gray-600">
                {user.name} • {user.council || 'System Administrator'}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {priorityIssues.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900">High Priority Issues</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                {priorityIssues.length} issue{priorityIssues.length !== 1 ? 's' : ''} require{priorityIssues.length === 1 ? 's' : ''} immediate attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priorityIssues.slice(0, 3).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-red-200 bg-white p-3 transition-shadow hover:shadow-md"
                    onClick={() => handleViewDetails(issue)}
                  >
                    <div>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm text-gray-600">{issue.location.address}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-red-600">Priority {issue.priority}</div>
                      <div className="text-gray-500">{issue.votes} votes</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Issues</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{issues.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Reported</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{issues.filter((issue) => issue.status === 'reported').length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">In Progress</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{issues.filter((issue) => issue.status === 'in_progress' || issue.status === 'under_review').length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Resolved</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{issues.filter((issue) => issue.status === 'resolved').length}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="issues" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'max-w-[800px] grid-cols-4' : 'max-w-[600px] grid-cols-3'}`}>
            <TabsTrigger value="issues"><List className="mr-2 h-4 w-4" />Issues</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
            {isAdmin && <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>}
          </TabsList>

          <TabsContent value="issues" className="mt-6">
            <Card className="mb-6">
              <CardHeader><CardTitle>Filter Issues</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input placeholder="Search issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(issueTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={minPriority} onValueChange={setMinPriority}>
                    <SelectTrigger><SelectValue placeholder="Min Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="8">Critical (8+)</SelectItem>
                      <SelectItem value="6">High (6+)</SelectItem>
                      <SelectItem value="4">Medium (4+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues List</CardTitle>
                <CardDescription>{filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueList issues={sortedIssues} onViewDetails={handleViewDetails} />
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard issues={issues} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="mt-6">
              <AdminUserPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <IssueDetailsDialog
        issue={selectedIssue}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onStatusChange={handleStatusChange}
        isCouncilView
      />
    </div>
  );
}
