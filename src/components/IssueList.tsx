import React from 'react';
import { Issue } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { issueTypeLabels, statusLabels, statusColors } from '../data/mockData';
import { getPriorityInfo } from '../utils/priorityAlgorithm';
import { Eye, ThumbsUp } from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onViewDetails: (issue: Issue) => void;
  onVote?: (issueId: string) => void;
}

export function IssueList({ issues, onViewDetails, onVote }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No issues found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Priority</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => {
            const priorityInfo = getPriorityInfo(issue.priority);
            const reportedDate = new Date(issue.reportedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short'
            });

            return (
              <TableRow key={issue.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityInfo.color}`} />
                    <span className="font-semibold">{issue.priority}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[300px]">
                      {issue.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {issueTypeLabels[issue.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-[200px] truncate">
                    {issue.location.address}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[issue.status]}>
                    {statusLabels[issue.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{issue.votes}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{reportedDate}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(issue)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
