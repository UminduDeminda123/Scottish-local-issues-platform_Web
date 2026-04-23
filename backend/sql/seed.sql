USE scottish_local_issues;

INSERT INTO users (name, email, password_hash, role, council)
VALUES
  ('Citizen Demo', 'citizen@example.com', '$2a$10$8QhRtwM4Q9wzT4k8jXEvA.e5Hl5abZEWSIk2s9InBezVPSv.6sg6m', 'citizen', NULL),
  ('Council Demo', 'council@example.com', '$2a$10$8QhRtwM4Q9wzT4k8jXEvA.e5Hl5abZEWSIk2s9InBezVPSv.6sg6m', 'council', 'City of Edinburgh Council'),
  ('Platform Admin', 'admin@council.com', '$2a$10$8QhRtwM4Q9wzT4k8jXEvA.e5Hl5abZEWSIk2s9InBezVPSv.6sg6m', 'admin', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), council = VALUES(council);

INSERT INTO issues (
  type, title, description, address, latitude, longitude, status, priority, reported_by, council_notes, votes, reported_at, updated_at, resolved_at
)
VALUES
  ('pothole', 'Large pothole on main road', 'Dangerous pothole causing traffic issues and potential vehicle damage.', 'Princes Street, Edinburgh EH2', 55.9533, -3.1883, 'reported', 9, 1, NULL, 23, '2026-01-10 09:00:00', '2026-01-16 11:30:00', NULL),
  ('streetlight', 'Streetlight not working', 'Streetlight has been out for several days, making the area unsafe at night.', 'Leith Walk, Edinburgh EH6', 55.9620, -3.1762, 'under_review', 7, 1, 'Inspection requested by lighting team.', 12, '2026-01-08 20:15:00', '2026-01-14 10:00:00', NULL),
  ('flooding', 'Blocked drain causing flooding', 'Heavy rain leads to pooling water across the road and pavement.', 'Gorgie Road, Edinburgh EH11', 55.9391, -3.2334, 'in_progress', 10, 1, 'Drainage team assigned and site visit booked.', 19, '2026-01-05 08:45:00', '2026-01-15 09:20:00', NULL),
  ('graffiti', 'Graffiti on public wall', 'Repeated graffiti on the side wall near the bus stop.', 'High Street, Edinburgh EH1', 55.9505, -3.1878, 'resolved', 5, 1, 'Cleaned and anti-graffiti coating applied.', 4, '2025-12-20 13:10:00', '2026-01-03 15:50:00', '2026-01-03 15:50:00')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), address = VALUES(address), status = VALUES(status), priority = VALUES(priority), council_notes = VALUES(council_notes), votes = VALUES(votes), updated_at = VALUES(updated_at), resolved_at = VALUES(resolved_at);
