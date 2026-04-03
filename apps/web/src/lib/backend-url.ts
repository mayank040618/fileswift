const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8080';

const stripTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

const stripTerminalApiSegment = (value: string): string => {
  if (/\/api$/i.test(value)) {
    return value.slice(0, -4);
  }
  return value;
};

export const getBackendOrigin = (): string => {
  const raw = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '').trim();

  if (!raw) {
    return DEFAULT_BACKEND_ORIGIN;
  }

  const withoutTrailingSlash = stripTrailingSlashes(raw);
  const normalized = stripTerminalApiSegment(withoutTrailingSlash);

  return normalized || DEFAULT_BACKEND_ORIGIN;
};

export const buildBackendUrl = (path: string): string => {
  const origin = getBackendOrigin();

  if (!path) {
    return origin;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};
