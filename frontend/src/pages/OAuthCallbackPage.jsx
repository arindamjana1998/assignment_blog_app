import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

// Track globally to prevent duplicate invocation across React 18 StrictMode double-mounting
let globalProcessedOAuthToken = null;

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthToken } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      if (!processedRef.current) {
        processedRef.current = true;
        toast.error(decodeURIComponent(error), { id: 'oauth-signin' });
        navigate('/login', { replace: true });
      }
      return;
    }

    if (token) {
      if (processedRef.current || globalProcessedOAuthToken === token) {
        return;
      }
      processedRef.current = true;
      globalProcessedOAuthToken = token;

      handleOAuthToken(token)
        .then((user) => {
          if (user?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch(() => {
          globalProcessedOAuthToken = null;
          navigate('/login', { replace: true });
        });
    } else {
      if (!processedRef.current) {
        processedRef.current = true;
        toast.error('Authentication token missing from OAuth redirect.', { id: 'oauth-signin' });
        navigate('/login', { replace: true });
      }
    }
  }, [searchParams, handleOAuthToken, navigate]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4 p-8">
        <Spinner size="lg" />
        <h3 className="text-base font-semibold text-slate-800">
          Completing Single Sign-On...
        </h3>
        <p className="text-xs text-slate-400">
          Please wait while we initialize your secure session.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
