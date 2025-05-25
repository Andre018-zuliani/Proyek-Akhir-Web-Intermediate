import { getActiveRoute } from '../routes/url-parser';
import { ACCESS_TOKEN_KEY } from '../config';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

// src/scripts/utils/auth.js

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    // Kembalikan objek dengan method render & afterRender, bukan null
    return {
      render: async () => '', // Tidak merender apa-apa karena redirect
      afterRender: async () => {},
    };
  }

  return page;
}

export function checkAuthenticatedRoute(pageInstance) {
  const token = getAccessToken();
  if (!token) {
    location.hash = '/login';
    return {
      render: async () => '',
      afterRender: async () => {},
    };
  }
  return pageInstance;
}

export function getLogout() {
  removeAccessToken();
}
