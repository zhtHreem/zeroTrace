import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { ensureIdentity } from '../../lib/anonIdentity';

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
        const userId = data.user._id;
        localStorage.setItem('uid', JSON.stringify(userId));
        localStorage.setItem('user', JSON.stringify(userData));

        // Join the anonymous group (or confirm we already have). Never blocks sign-in.
        const idResult = await ensureIdentity(userId, tokenResponse.access_token);
        if (idResult.status === 'restore-needed') {
          localStorage.setItem('zt_restore_needed', '1');
        } else if (idResult.status === 'error') {
          toast.error(idResult.message);
        }

        window.location.assign(idResult.status === 'restore-needed' ? `/user/${userId}` : '/');
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
