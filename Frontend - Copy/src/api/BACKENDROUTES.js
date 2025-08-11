const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ROUTES = {
  auth: {
    signup: `${BASE_URL}/auth/signup`,
    login: `${BASE_URL}/auth/login`,
    refresh: `${BASE_URL}/auth/refresh`,
    logout: `${BASE_URL}/auth/logout`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    verifyEmail: `${BASE_URL}/auth/verify-email`
  },
  users: {
    me: `${BASE_URL}/users/me`,
    updateProfile: `${BASE_URL}/users/me`,
    uploadAvatar: `${BASE_URL}/users/me/avatar`
  },
  trips: {
    getAll: `${BASE_URL}/trips`,
    create: `${BASE_URL}/trips`,
    getById: (id) => `${BASE_URL}/trips/${id}`,
    update: (id) => `${BASE_URL}/trips/${id}`,
    delete: (id) => `${BASE_URL}/trips/${id}`,
    budget: (id) => `${BASE_URL}/trips/${id}/budget`,
    summary: (id) => `${BASE_URL}/trips/${id}/summary`,
    share: (id) => `${BASE_URL}/trips/${id}/share`,
    addStop: (id) => `${BASE_URL}/trips/${id}/stops`,
    updateStop: (tripId, stopId) => `${BASE_URL}/trips/${tripId}/stops/${stopId}`,
    deleteStop: (tripId, stopId) => `${BASE_URL}/trips/${tripId}/stops/${stopId}`,
    addActivity: (tripId, stopId) => `${BASE_URL}/trips/${tripId}/stops/${stopId}/activities`,
    updateActivity: (tripId, stopId, actId) => `${BASE_URL}/trips/${tripId}/stops/${stopId}/activities/${actId}`,
    deleteActivity: (tripId, stopId, actId) => `${BASE_URL}/trips/${tripId}/stops/${stopId}/activities/${actId}`
  },
  public: {
    view: (publicId) => `${BASE_URL}/public/${publicId}`,
    list: `${BASE_URL}/public/trips`
  },
  admin: {
    stats: `${BASE_URL}/admin/stats`,
    users: `${BASE_URL}/admin/users`,
    updateUser: (id) => `${BASE_URL}/admin/users/${id}`,
    deleteUser: (id) => `${BASE_URL}/admin/users/${id}`
  }
};