import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Issue, IssueType } from '../types';
import { issueTypeLabels } from '../data/mockData';
import { MapPin } from 'lucide-react';

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (issue: Omit<Issue, 'id' | 'reportedAt' | 'updatedAt' | 'priority' | 'votes'>) => void;
  userName: string;
}

export function ReportIssueDialog({ open, onOpenChange, onSubmit, userName }: ReportIssueDialogProps) {
  const [formData, setFormData] = useState({
    type: '' as IssueType,
    title: '',
    description: '',
    address: '',
    lat: 55.9533,
    lng: -3.1883
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    const issue: Omit<Issue, 'id' | 'reportedAt' | 'updatedAt' | 'priority' | 'votes'> = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      location: {
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address
      },
      status: 'reported',
      reportedBy: userName
    };

    onSubmit(issue);
    
    // Reset form
    setFormData({
      type: '' as IssueType,
      title: '',
      description: '',
      address: '',
      lat: 55.9533,
      lng: -3.1883
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report a Local Issue</DialogTitle>
          <DialogDescription>
            Help improve your community by reporting local problems
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Issue Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as IssueType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(issueTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Location Address *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="address"
                  placeholder="e.g., High Street, Edinburgh EH1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <Button type="button" variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              In a real app, you could click the map icon to select location
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Adding photos and exact location helps the council respond faster.
              In the full version, you can upload images and use GPS location.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
