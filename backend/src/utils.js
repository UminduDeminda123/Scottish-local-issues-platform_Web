const { ISSUE_TYPES } = require('./constants');

function calculatePriority(issue) {
  const typeSeverity = {
    flooding: 9,
    pothole: 8,
    broken_pavement: 7,
    streetlight: 7,
    abandoned_vehicle: 5,
    litter: 4,
    graffiti: 4,
    other: 5
  };

  const baseSeverity = typeSeverity[issue.type] || 5;
  const voteWeight = Math.min((Number(issue.votes) || 0) / 10, 2);
  const ageInDays = Math.floor((Date.now() - new Date(issue.reported_at).getTime()) / (1000 * 60 * 60 * 24));
  const ageWeight = Math.min(ageInDays / 7, 2);
  const statusWeight = issue.status === 'reported' ? 1 : 0;
  const rawPriority = baseSeverity + voteWeight + ageWeight + statusWeight;
  return Math.min(Math.round(rawPriority), 10);
}

function mapIssueRow(row) {
  return {
    id: String(row.id),
    type: row.type,
    title: row.title,
    description: row.description,
    location: {
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      address: row.address
    },
    status: row.status,
    priority: Number(row.priority),
    reportedBy: row.reported_by_name,
    reportedById: row.reported_by,
    reportedAt: row.reported_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    imageUrl: row.image_url,
    councilNotes: row.council_notes,
    votes: Number(row.votes)
  };
}

function buildIssueFilters(query, params) {
  const conditions = [];

  if (query.type && ISSUE_TYPES.includes(query.type)) {
    conditions.push('i.type = ?');
    params.push(query.type);
  }

  if (query.status) {
    conditions.push('i.status = ?');
    params.push(query.status);
  }

  if (query.minPriority && !Number.isNaN(Number(query.minPriority))) {
    conditions.push('i.priority >= ?');
    params.push(Number(query.minPriority));
  }

  if (query.search) {
    conditions.push('(i.title LIKE ? OR i.description LIKE ? OR i.address LIKE ?)');
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }

  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

module.exports = {
  calculatePriority,
  mapIssueRow,
  buildIssueFilters
};
