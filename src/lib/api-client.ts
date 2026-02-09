/**
 * Comprehensive API Client for RentSnap
 * Handles all communication with Django backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

class ApiClient {
    private baseURL: string;
    private cache: Map<string, { data: any; timestamp: number }>;
    private cacheTTL: number = 30000; // 30 seconds

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.cache = new Map();
    }

    private getAuthHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('rentsnapToken');
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
        }

        return headers;
    }

    private getCacheKey(endpoint: string, params?: Record<string, any>): string {
        const paramString = params ? JSON.stringify(params) : '';
        return `${endpoint}${paramString}`;
    }

    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    clearCache(endpoint?: string): void {
        if (endpoint) {
            // Clear all cache entries starting with this endpoint
            Array.from(this.cache.keys())
                .filter(key => key.startsWith(endpoint))
                .forEach(key => this.cache.delete(key));
        } else {
            this.cache.clear();
        }
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 204) {
            return null as T;
        }

        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        if (!response.ok) {
            let errorMessage = `API request failed with status ${response.status}`;
            let errors: Record<string, string[]> | undefined;

            if (isJson) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                    errors = errorData.errors || errorData;
                } catch (e) {
                    // Failed to parse error JSON
                }
            }

            const apiError: ApiError = {
                message: errorMessage,
                status: response.status,
                errors,
            };

            // Handle unauthorized - redirect to login
            if (response.status === 401 && typeof window !== 'undefined') {
                localStorage.removeItem('rentsnapToken');
                localStorage.removeItem('rentsnapActiveUserId');
                window.location.href = '/login';
            }

            throw apiError;
        }

        if (isJson) {
            return response.json();
        }

        return response.text() as T;
    }

    async get<T>(endpoint: string, params?: Record<string, any>, useCache: boolean = true): Promise<T> {
        const cacheKey = this.getCacheKey(endpoint, params);

        // Check cache for GET requests
        if (useCache) {
            const cached = this.getFromCache(cacheKey);
            if (cached !== null) {
                return cached;
            }
        }

        const queryString = params
            ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null)).toString()
            : '';

        const response = await fetch(`${this.baseURL}${endpoint}${queryString}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        const data = await this.handleResponse<T>(response);

        // Cache successful GET requests
        if (useCache) {
            this.setCache(cacheKey, data);
        }

        return data;
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        this.clearCache(endpoint); // Invalidate cache for this endpoint

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: data instanceof FormData ? data : JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        this.clearCache(endpoint);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        this.clearCache(endpoint);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string): Promise<T> {
        this.clearCache(endpoint);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
            });
        }

        const headers = this.getAuthHeaders();
        delete (headers as any)['Content-Type']; // Let browser set Content-Type for FormData

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return this.handleResponse<T>(response);
    }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL);

// Export types
export type { ApiError };
