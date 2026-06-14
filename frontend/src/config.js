// Yahan apna live server ka URL daalein jab deploy karein
// Example: VITE_API_URL=https://hospital-backend.onrender.com (in your .env)

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
