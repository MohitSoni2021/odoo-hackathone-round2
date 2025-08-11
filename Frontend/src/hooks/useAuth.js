import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../features/auth/AuthSlice';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, status } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token && !user && isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isAuthenticated]);

  const isAdmin = user?.role === 'admin';
  const isLoading = status === 'loading';

  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    token
  };
};

export default useAuth;