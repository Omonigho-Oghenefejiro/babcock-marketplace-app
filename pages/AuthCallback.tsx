import { useEffect } from 'react';
import API from '../services/api';

const mapUser = (user: any) => ({
  id: user?.id || user?._id,
  username: user?.username,
  name: user?.fullName || user?.name || 'User',
  fullName: user?.fullName || user?.name,
  email: user?.email,
  phone: user?.phone,
  campusRole: user?.campusRole,
  role: user?.role || 'user',
  isVerified: user?.isVerified ?? false,
  avatar: user?.profileImage || user?.avatar,
  profileImage: user?.profileImage || user?.avatar,
  ratings: user?.ratings,
});

const AuthCallback = () => {
  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refreshToken = params.get('refreshToken');

      if (!token) {
        window.location.replace('/#/login?error=google_failed');
        return;
      }

      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');

      if (refreshToken) {
        sessionStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.removeItem('refreshToken');

      try {
        const { data } = await API.get('/auth/profile');
        const mappedUser = mapUser(data);
        sessionStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.removeItem('user');
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.replace('/#/login?error=google_profile_failed');
        return;
      }

      // Force rehydration of auth state from storage in StoreProvider.
      window.location.replace('/#/');
    };

    finishLogin();
  }, []);

  return <div className="p-6 text-center">Signing you in...</div>;
};

export default AuthCallback;
