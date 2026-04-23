import React, { useState } from 'react';
import { Issue } from '../types';
import { issueTypeLabels, issueTypeColors, statusLabels } from '../data/mockData';
import { getPriorityInfo } from '../utils/priorityAlgorithm';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

interface SimpleMapProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
}

export function SimpleMap({ issues, onIssueClick }: SimpleMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Calculate map bounds
  const lats = issues.map(i => i.location.lat);
  const lngs = issues.map(i => i.location.lng);
  const minLat = Math.min(...lats, 55.9);
  const maxLat = Math.max(...lats, 56.0);
  const minLng = Math.min(...lngs, -3.3);
  const maxLng = Math.max(...lngs, -3.0);

  // Convert lat/lng to pixel position
  const latLngToPixel = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue);
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border bg-gray-100 relative">
      {/* Map Background with Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Street Names Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-xs text-gray-400 font-medium rotate-[-15deg]">
          Princes Street
        </div>
        <div className="absolute top-1/2 left-1/3 text-xs text-gray-400 font-medium">
          High Street
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-xs text-gray-400 font-medium rotate-[20deg]">
          The Meadows
        </div>
      </div>

      {/* Issue Markers */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {issues.map((issue) => {
          const containerWidth = 800; // approximate
          const containerHeight = 600; // approximate
          const pos = latLngToPixel(issue.location.lat, issue.location.lng, containerWidth, containerHeight);
          const color = issueTypeColors[issue.type];
          const priorityInfo = getPriorityInfo(issue.priority);

          return (
            <g key={issue.id} className="pointer-events-auto cursor-pointer" onClick={() => handleMarkerClick(issue)}>
              {/* Marker Pin */}
              <circle
                cx={`${(pos.x / containerWidth) * 100}%`}
                cy={`${(pos.y / containerHeight) * 100}%`}
                r="20"
                fill={color}
                stroke="white"
                strokeWidth="3"
                opacity="0.9"
                className="hover:opacity-100 transition-opacity"
              />
              {/* Priority Number */}
              <text
                x={`${(pos.x / containerWidth) * 100}%`}
                y={`${(pos.y / containerHeight) * 100}%`}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none"
              >
                {issue.priority}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 max-w-xs pointer-events-auto">
        <div className="text-xs font-semibold mb-2">Map Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>Number indicates priority (1-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Pothole</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Litter/Bins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Streetlight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Flooding</span>
          </div>
        </div>
      </Card>

      {/* Issue Details Popup */}
      {selectedIssue && (
        <Card className="absolute top-4 right-4 p-4 max-w-sm pointer-events-auto">
          <button
            onClick={() => setSelectedIssue(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          <div className="space-y-2">
            <h3 className="font-semibold pr-6">{selectedIssue.title}</h3>
            <p className="text-sm text-gray-600">{selectedIssue.description}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {issueTypeLabels[selectedIssue.type]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {statusLabels[selectedIssue.status]}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityInfo(selectedIssue.priority).color}`} />
              <span className="text-xs font-medium">
                Priority: {getPriorityInfo(selectedIssue.priority).label} ({selectedIssue.priority}/10)
              </span>
            </div>
            
            <p className="text-xs text-gray-500">{selectedIssue.location.address}</p>
            <p className="text-xs text-gray-500">
              {selectedIssue.votes} community votes
            </p>
            
            {onIssueClick && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => onIssueClick(selectedIssue)}
              >
                View Full Details
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        Edinburgh, Scotland
      </div>
    </div>
  );
}
