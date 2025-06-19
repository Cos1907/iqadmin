// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.iqtestim.com' 
  : 'http://localhost:5000';

export const IMAGE_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.iqtestim.com'
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/admin-login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
  
  // Admin
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_ACTIVITIES: `${API_BASE_URL}/api/admin-activities`,
  
  // Tests
  TESTS: `${API_BASE_URL}/api/tests`,
  TEST_RESULTS: `${API_BASE_URL}/api/test-results`,
  TEST_RESULTS_ANALYTICS: `${API_BASE_URL}/api/test-results/analytics/overview`,
  
  // Questions
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  
  // Blog
  BLOG: `${API_BASE_URL}/api/blog`,
  BLOG_ADMIN_ALL: `${API_BASE_URL}/api/blog/admin/all`,
  BLOG_STATS: `${API_BASE_URL}/api/blog/stats/overview`,
  BLOG_UPLOAD_IMAGE: `${API_BASE_URL}/api/blog/upload-image`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATIONS_STATS: `${API_BASE_URL}/api/notifications/stats/overview`,
  NOTIFICATIONS_SEND: `${API_BASE_URL}/api/notifications`,
  
  // Subscriptions
  SUBSCRIPTIONS: `${API_BASE_URL}/api/subscriptions`,
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscription-plans`,
  
  // IQ Rankings
  IQ_RANKINGS: `${API_BASE_URL}/api/iq-rankings`,
  
  // Campaigns
  CAMPAIGNS: `${API_BASE_URL}/api/campaigns`,
  
  // Pixels
  PIXELS: `${API_BASE_URL}/api/pixels`,
  
  // Pages
  PAGES: `${API_BASE_URL}/api/pages`,
  
  // Health Check
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL; 