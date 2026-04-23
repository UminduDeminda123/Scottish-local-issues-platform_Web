CREATE DATABASE IF NOT EXISTS scottish_local_issues;
USE scottish_local_issues;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'council', 'admin') NOT NULL DEFAULT 'citizen',
  council VARCHAR(190) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS issues (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('pothole', 'litter', 'streetlight', 'flooding', 'graffiti', 'abandoned_vehicle', 'broken_pavement', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  status ENUM('reported', 'under_review', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'reported',
  priority TINYINT UNSIGNED NOT NULL DEFAULT 1,
  reported_by INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NULL,
  council_notes TEXT NULL,
  votes INT UNSIGNED NOT NULL DEFAULT 1,
  reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_issues_status (status),
  KEY idx_issues_type (type),
  KEY idx_issues_priority (priority),
  CONSTRAINT fk_issues_reported_by FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS issue_votes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  issue_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_issue_user_vote (issue_id, user_id),
  KEY idx_issue_votes_user (user_id),
  CONSTRAINT fk_issue_votes_issue FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
  CONSTRAINT fk_issue_votes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
