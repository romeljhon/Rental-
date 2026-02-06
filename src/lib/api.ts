const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30000; // 30 seconds

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = endpoint;

    // Return cached data if available and fresh
    if (isGet && cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
        return cache[cacheKey].data;
    }

    const headers: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('rentaleaseToken');
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 204) return null;
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Cache the result for GET requests
    if (isGet) {
        cache[cacheKey] = {
            data,
            timestamp: Date.now()
        };
    }

    return data;
}

export function clearApiCache(endpoint?: string) {
    if (endpoint) {
        delete cache[endpoint];
    } else {
        Object.keys(cache).forEach(key => delete cache[key]);
    }
}
