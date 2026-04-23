import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Issue, IssueStatus } from '../types';
import { issueTypeLabels, statusLabels, statusColors } from '../data/mockData';
import { getPriorityInfo } from '../utils/priorityAlgorithm';
import { MapPin, Calendar, User, ThumbsUp, MessageSquare } from 'lucide-react';
import { Separator } from './ui/separator';

interface IssueDetailsDialogProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (issueId: string, newStatus: IssueStatus, notes?: string) => void;
  onVote?: (issueId: string) => void;
  isCouncilView?: boolean;
}

export function IssueDetailsDialog({
  issue,
  open,
  onOpenChange,
  onStatusChange,
  onVote,
  isCouncilView = false
}: IssueDetailsDialogProps) {
  const [newStatus, setNewStatus] = React.useState<IssueStatus>('reported');
  const [councilNotes, setCouncilNotes] = React.useState('');

  React.useEffect(() => {
    if (issue) {
      setNewStatus(issue.status);
      setCouncilNotes(issue.councilNotes || '');
    }
  }, [issue]);

  if (!issue) return null;

  const priorityInfo = getPriorityInfo(issue.priority);

  const handleUpdateStatus = () => {
    if (onStatusChange) {
      onStatusChange(issue.id, newStatus, councilNotes);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{issue.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {issueTypeLabels[issue.type]} • Reported by {issue.reportedBy}
              </DialogDescription>
            </div>
            <Badge className={statusColors[issue.status]}>
              {statusLabels[issue.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`} />
            <span className="font-semibold">
              Priority: {priorityInfo.label} ({issue.priority}/10)
            </span>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-gray-700">{issue.description}</p>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
            <div>
              <h4 className="font-semibold text-sm">Location</h4>
              <p className="text-sm text-gray-600">{issue.location.address}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-gray-500" />
            <div>
              <h4 className="font-semibold text-sm">Timeline</h4>
              <p className="text-sm text-gray-600">
                Reported: {new Date(issue.reportedAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-600">
                Last updated: {new Date(issue.updatedAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              {issue.resolvedAt && (
                <p className="text-sm text-green-600 font-medium">
                  Resolved: {new Date(issue.resolvedAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Community Support */}
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{issue.votes} community votes</span>
            {!isCouncilView && onVote && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVote(issue.id)}
              >
                Vote for this issue
              </Button>
            )}
          </div>

          {/* Council Notes */}
          {issue.councilNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-sm text-blue-900">Council Update</h4>
                  <p className="text-sm text-blue-800">{issue.councilNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Council Actions */}
          {isCouncilView && onStatusChange && (
            <>
              <Separator />
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Council Actions</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as IssueStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Council Notes</label>
                  <Textarea
                    placeholder="Add notes about actions taken or planned..."
                    value={councilNotes}
                    onChange={(e) => setCouncilNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleUpdateStatus} className="w-full">
                  Update Issue
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
