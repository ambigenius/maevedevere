const LOCAL_API_BASE = 'http://localhost:3001/api';
const PROD_API_BASE = 'https://mdvvercel.vercel.app/api';

const resolveApiBase = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return LOCAL_API_BASE;
    }
  }

  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  return PROD_API_BASE;
};

const getApiBase = (): string => resolveApiBase();
const getApiOrigin = (): string => getApiBase().replace(/\/api$/, '');

export { getApiBase, getApiOrigin };
