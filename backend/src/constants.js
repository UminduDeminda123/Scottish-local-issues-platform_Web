const ISSUE_TYPES = [
  'pothole',
  'litter',
  'streetlight',
  'flooding',
  'graffiti',
  'abandoned_vehicle',
  'broken_pavement',
  'other'
];

const ISSUE_STATUSES = [
  'reported',
  'under_review',
  'in_progress',
  'resolved',
  'closed'
];

const USER_ROLES = ['citizen', 'council', 'admin'];

module.exports = {
  ISSUE_TYPES,
  ISSUE_STATUSES,
  USER_ROLES
};
