const LOCAL_API_BASE = 'http://localhost:3001/api';
const PROD_API_BASE = 'https://mdvvercel.vercel.app/api';

const determineApiBase = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return LOCAL_API_BASE;
  }

  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  return PROD_API_BASE;
};

const API_BASE = determineApiBase();
const API_ORIGIN = API_BASE.replace(/\/api$/, '');

if (typeof console !== 'undefined') {
  console.info('[config] API_BASE resolved to', API_BASE);
}

export { API_BASE, API_ORIGIN, determineApiBase };
