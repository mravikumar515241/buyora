import axiosClient from '../api/axiosClient';

export const passwordResetService = {
  // Send forgot password email
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/api/auth/password/forgot', { email });
    return response.data;
  },

  // Validate reset token
  validateToken: async (token) => {
    const response = await axiosClient.get('/api/auth/password/validate-token', {
      params: { token }
    });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await axiosClient.post('/api/auth/password/reset', {
      token,
      newPassword
    });
    return response.data;
  }
};
