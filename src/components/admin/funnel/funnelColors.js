// Shared stage colors and ordering for all funnel dashboard components.
// Light-theme palette: blue → teal → green → gold (Transbill branding).

export const STAGE_COLORS = {
  landing_page_visit:  '#1E3A8A',
  application_started:  '#2563EB',
  assessment_started:  '#0891B2',
  interview_ready:     '#0D9488',
  interview_booked:    '#059669',
  interview_completed: '#16A34A',
  training_invited:    '#CA8A04',
};

export const STAGE_KEYS = [
  'landing_page_visit', 'application_started', 'assessment_started',
  'interview_ready', 'interview_booked', 'interview_completed', 'training_invited',
];

export const STAGE_LABELS = {
  landing_page_visit:  'Landing Page Visits',
  application_started: 'Started Application',
  assessment_started:  'Started Assessment',
  interview_ready:     'Interview Ready',
  interview_booked:    'Interview Booked',
  interview_completed: 'Interview Completed',
  training_invited:    'Invited for Training',
};

// Portal theme tokens
export const PORTAL = {
  sidebarBg:   '#0A2540',
  sidebarBorder: '#1A3A5C',
  gold:        '#C9A227',
  mainBg:      '#F4F6F9',
  panelBg:     '#FFFFFF',
  panelBorder: '#E5E7EB',
  darkBlue:    '#0A2540',
  bodyText:    '#1F2937',
  mutedText:   '#6B7280',
  lightMuted:  '#9CA3AF',
  hoverBg:     '#F9FAFB',
};