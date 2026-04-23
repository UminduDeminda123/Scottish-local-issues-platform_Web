import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Issue, IssueType } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { issueTypeLabels, issueTypeColors } from '../data/mockData';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  issues: Issue[];
}

export function AnalyticsDashboard({ issues }: AnalyticsDashboardProps) {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved').length;
  const activeIssues = issues.filter((issue) => issue.status !== 'resolved' && issue.status !== 'closed').length;
  const avgPriority = totalIssues > 0 ? (issues.reduce((sum, issue) => sum + issue.priority, 0) / totalIssues).toFixed(1) : '0.0';

  const issuesByType = Object.keys(issueTypeLabels).map((type) => ({
    name: issueTypeLabels[type as IssueType],
    value: issues.filter((issue) => issue.type === type).length,
    color: issueTypeColors[type as IssueType]
  })).filter((item) => item.value > 0);

  const issuesByStatus = [
    { name: 'Reported', value: issues.filter((issue) => issue.status === 'reported').length },
    { name: 'Under Review', value: issues.filter((issue) => issue.status === 'under_review').length },
    { name: 'In Progress', value: issues.filter((issue) => issue.status === 'in_progress').length },
    { name: 'Resolved', value: issues.filter((issue) => issue.status === 'resolved').length },
  ].filter((item) => item.value > 0);

  const statusColors = ['#ef4444', '#eab308', '#3b82f6', '#10b981'];

  const issuesByMonth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthName = date.toLocaleString('default', { month: 'short' });

    const count = issues.filter((issue) => {
      const issueDate = new Date(issue.reportedAt);
      return issueDate.getMonth() === date.getMonth() && issueDate.getFullYear() === date.getFullYear();
    }).length;

    return { month: monthName, count };
  });

  const areaCount = new Map<string, number>();
  issues.forEach((issue) => {
    const area = issue.location.address.split(',').pop()?.trim() || 'Unknown';
    areaCount.set(area, (areaCount.get(area) || 0) + 1);
  });

  const topAreas = Array.from(areaCount.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const resolvedWithDates = issues.filter((issue) => issue.resolvedAt);
  const avgResolutionDays = resolvedWithDates.length > 0
    ? resolvedWithDates.reduce((sum, issue) => {
        const days = Math.floor((new Date(issue.resolvedAt!).getTime() - new Date(issue.reportedAt).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / resolvedWithDates.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIssues}</div>
            <p className="text-xs text-muted-foreground">Reported to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIssues}</div>
            <p className="text-xs text-muted-foreground">Currently being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedIssues}</div>
            <p className="text-xs text-muted-foreground">{totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}% resolution rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionDays.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">Average priority: {avgPriority}/10</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
            <CardDescription>Distribution of issue categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={issuesByType} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {issuesByType.map((entry, index) => <Cell key={`type-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Current status of all reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuesByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {issuesByStatus.map((_, index) => <Cell key={`status-${index}`} fill={statusColors[index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
