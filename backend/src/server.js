require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authRequired, requireRole } = require('./middleware');
const { USER_ROLES, ISSUE_TYPES, ISSUE_STATUSES } = require('./constants');
const { calculatePriority, mapIssueRow, buildIssueFilters } = require('./utils');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      council: user.council
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    council: user.council
  };
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'API and database are working.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Database connection failed.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const role = 'citizen';

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, council)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, null]
    );

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: String(result.insertId),
        email,
        name,
        role,
        council: null
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error while creating account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role, council FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, council FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: serializeUser(rows[0]) });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while loading user profile.' });
  }
});

app.get('/api/issues', async (req, res) => {
  try {
    const params = [];
    const whereClause = buildIssueFilters(req.query, params);

    const [rows] = await pool.query(
      `SELECT i.*, u.name AS reported_by_name
       FROM issues i
       INNER JOIN users u ON u.id = i.reported_by
       ${whereClause}
       ORDER BY i.priority DESC, i.updated_at DESC`,
      params
    );

    res.json({ issues: rows.map(mapIssueRow) });
  } catch (error) {
    console.error('Fetch issues error:', error);
    res.status(500).json({ message: 'Server error while fetching issues.' });
  }
});

app.post('/api/issues', authRequired, requireRole('citizen'), async (req, res) => {
  try {
    const { type, title, description, location, imageUrl } = req.body;

    if (!type || !title || !description || !location?.address) {
      return res.status(400).json({ message: 'Type, title, description, and location are required.' });
    }

    if (!ISSUE_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid issue type.' });
    }

    const lat = Number(location.lat ?? 55.9533);
    const lng = Number(location.lng ?? -3.1883);
    const priority = calculatePriority({
      type,
      votes: 1,
      reported_at: new Date(),
      status: 'reported'
    });

    const [result] = await pool.query(
      `INSERT INTO issues (
        type, title, description, address, latitude, longitude,
        status, priority, reported_by, image_url, votes, reported_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?, 1, NOW(), NOW())`,
      [type, title, description, location.address, lat, lng, priority, req.user.id, imageUrl || null]
    );

    const [rows] = await pool.query(
      `SELECT i.*, u.name AS reported_by_name
       FROM issues i
       INNER JOIN users u ON u.id = i.reported_by
       WHERE i.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ issue: mapIssueRow(rows[0]) });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error while creating issue.' });
  }
});

app.post('/api/issues/:id/vote', authRequired, requireRole('citizen'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const issueId = req.params.id;
    const userId = req.user.id;

    const [issueRows] = await connection.query('SELECT * FROM issues WHERE id = ? FOR UPDATE', [issueId]);
    const issue = issueRows[0];

    if (!issue) {
      await connection.rollback();
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const [existingVoteRows] = await connection.query(
      'SELECT id FROM issue_votes WHERE issue_id = ? AND user_id = ?',
      [issueId, userId]
    );

    if (existingVoteRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'You have already voted for this issue.' });
    }

    await connection.query('INSERT INTO issue_votes (issue_id, user_id) VALUES (?, ?)', [issueId, userId]);

    const newVotes = Number(issue.votes) + 1;
    const newPriority = calculatePriority({ ...issue, votes: newVotes });

    await connection.query(
      'UPDATE issues SET votes = ?, priority = ?, updated_at = NOW() WHERE id = ?',
      [newVotes, newPriority, issueId]
    );

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT i.*, u.name AS reported_by_name
       FROM issues i
       INNER JOIN users u ON u.id = i.reported_by
       WHERE i.id = ?`,
      [issueId]
    );

    res.json({ issue: mapIssueRow(rows[0]) });
  } catch (error) {
    await connection.rollback();
    console.error('Vote issue error:', error);
    res.status(500).json({ message: 'Server error while voting for issue.' });
  } finally {
    connection.release();
  }
});

app.put('/api/issues/:id/status', authRequired, requireRole('council', 'admin'), async (req, res) => {
  try {
    const { status, councilNotes } = req.body;
    const issueId = req.params.id;

    if (!ISSUE_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid issue status.' });
    }

    const [issueRows] = await pool.query('SELECT * FROM issues WHERE id = ?', [issueId]);
    const issue = issueRows[0];

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    const resolvedAt = status === 'resolved' ? new Date() : null;
    const newPriority = calculatePriority({
      ...issue,
      status,
      votes: issue.votes,
      reported_at: issue.reported_at
    });

    await pool.query(
      `UPDATE issues
       SET status = ?, council_notes = ?, resolved_at = ?, priority = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, councilNotes || null, resolvedAt, newPriority, issueId]
    );

    const [rows] = await pool.query(
      `SELECT i.*, u.name AS reported_by_name
       FROM issues i
       INNER JOIN users u ON u.id = i.reported_by
       WHERE i.id = ?`,
      [issueId]
    );

    res.json({ issue: mapIssueRow(rows[0]) });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error while updating issue.' });
  }
});

app.get('/api/analytics/summary', authRequired, requireRole('council', 'admin'), async (req, res) => {
  try {
    const [typeRows] = await pool.query('SELECT type, COUNT(*) AS count FROM issues GROUP BY type');
    const [statusRows] = await pool.query('SELECT status, COUNT(*) AS count FROM issues GROUP BY status');
    const [monthRows] = await pool.query(
      `SELECT DATE_FORMAT(reported_at, '%Y-%m') AS month_key,
              DATE_FORMAT(reported_at, '%b %Y') AS month,
              COUNT(*) AS count
       FROM issues
       GROUP BY month_key, month
       ORDER BY month_key ASC`
    );
    const [areaRows] = await pool.query(
      `SELECT SUBSTRING_INDEX(address, ',', -1) AS area, COUNT(*) AS count
       FROM issues
       GROUP BY area
       ORDER BY count DESC
       LIMIT 5`
    );
    const [avgRows] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(DAY, reported_at, resolved_at)) AS avgResolutionTime
       FROM issues
       WHERE resolved_at IS NOT NULL`
    );

    const issuesByType = {};
    typeRows.forEach((row) => {
      issuesByType[row.type] = Number(row.count);
    });

    const issuesByStatus = {};
    statusRows.forEach((row) => {
      issuesByStatus[row.status] = Number(row.count);
    });

    res.json({
      issuesByType,
      issuesByStatus,
      issuesByMonth: monthRows.map((row) => ({ month: row.month, count: Number(row.count) })),
      avgResolutionTime: Number(avgRows[0]?.avgResolutionTime || 0),
      topAreas: areaRows.map((row) => ({ area: row.area.trim(), count: Number(row.count) }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error while loading analytics.' });
  }
});

app.get('/api/admin/users', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, council, created_at
      FROM users
      WHERE role IN ('council', 'admin')
      ORDER BY created_at DESC
    `);

    res.json({
      users: rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        email: row.email,
        role: row.role,
        council: row.council,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Server error while loading users.' });
  }
});

app.post('/api/admin/users', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, council } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    if (!['council', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Only council or admin accounts can be created here.' });
    }

    if (role === 'council' && !council) {
      return res.status(400).json({ message: 'Council name is required for council users.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, council)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, role === 'council' ? council : null]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, role, council FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully.',
      user: serializeUser(rows[0])
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Server error while creating user.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
