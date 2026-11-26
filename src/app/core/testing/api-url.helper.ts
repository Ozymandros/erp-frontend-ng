import { environment } from '../../../environments/environment';

/** Builds the absolute request URL the same way ApiClientService does. */
export function apiUrl(path: string): string {
  const base = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
