import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../features/auth/AuthSlice';
import { updateUserData as updateUserAction } from '../features/auth/AuthSlice';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, status } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token && !user && isAuthenticated) {
      dispatch(getCurrentUser())
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [dispatch, user, isAuthenticated]);

  const isAdmin = user?.role === 'admin';
  const isAuthLoading = status === 'loading' || isLoading;

  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

  // Function to update user data in the component
  const updateUserData = (newData) => {
    dispatch(updateUserAction(newData));
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: isAuthLoading,
    token,
    updateUserData
  };
};

export default useAuth;