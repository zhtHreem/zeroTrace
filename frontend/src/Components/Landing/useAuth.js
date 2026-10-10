import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

export default function useAuth() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const uid = JSON.parse(localStorage.getItem('uid') || 'null');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userData = await info.json();
        const res = await fetch(`${process.env.REACT_APP_LOCAL_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleId: userData.sub, email: userData.email, name: userData.name }),
        });
        if (!res.ok) {
          const details = await res.json();
          throw new Error(details.error || 'Failed to login');
        }
        const data = await res.json();
        localStorage.setItem('uid', JSON.stringify(data.user._id));
        localStorage.setItem('user', JSON.stringify(userData));
        window.location.assign('/');
      } catch (err) {
        toast.error(err.message || 'Login failed');
      }
    },
    onError: () => toast.error('Google login failed. Please try again.'),
  });

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('uid');
    navigate(0);
  };

  return { user, uid, login, logout };
}
