import React, { useState } from 'react';
import { Issue, User } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SimpleMap } from './SimpleMap';
import { IssueList } from './IssueList';
import { IssueDetailsDialog } from './IssueDetailsDialog';
import { ReportIssueDialog } from './ReportIssueDialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Search, LogOut, MapIcon, List } from 'lucide-react';
import { issueTypeLabels, statusLabels } from '../data/mockData';
import { filterIssues, sortByPriority } from '../utils/priorityAlgorithm';

interface CitizenDashboardProps {
  user: User;
  issues: Issue[];
  onReportIssue: (issue: Omit<Issue, 'id' | 'reportedAt' | 'updatedAt' | 'priority' | 'votes'>) => void;
  onVoteIssue: (issueId: string) => void;
  onLogout: () => void;
}

export function CitizenDashboard({ user, issues, onReportIssue, onVoteIssue, onLogout }: CitizenDashboardProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Apply filters
  const filteredIssues = filterIssues(issues, {
    types: filterType !== 'all' ? [filterType] : undefined,
    statuses: filterStatus !== 'all' ? [filterStatus] : undefined,
    searchTerm: searchTerm || undefined
  });

  const sortedIssues = sortByPriority(filteredIssues);

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Local Issues Platform</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setReportDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issues.length}</div>
              <p className="text-xs text-gray-500">In your area</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length}
              </div>
              <p className="text-xs text-gray-500">Being addressed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {issues.filter(i => i.status === 'resolved').length}
              </div>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Find Issues</CardTitle>
            <CardDescription>Search and filter local issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(issueTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Map and List Views */}
        <Card>
          <CardHeader>
            <CardTitle>Issues Overview</CardTitle>
            <CardDescription>
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">

                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <div className="h-[600px]">
                  <SimpleMap
                    issues={filteredIssues}
                    onIssueClick={handleViewDetails}
                  />
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-4">
                <IssueList
                  issues={sortedIssues}
                  onViewDetails={handleViewDetails}
                  onVote={onVoteIssue}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <ReportIssueDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={onReportIssue}
        userName={user.name}
      />

      <IssueDetailsDialog
        issue={selectedIssue}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onVote={onVoteIssue}
        isCouncilView={false}
      />
    </div>
  );
}