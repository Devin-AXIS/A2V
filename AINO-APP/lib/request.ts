import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Request configuration interface
interface RequestConfig extends AxiosRequestConfig {
    showLoading?: boolean;
    showError?: boolean;
    timeout?: number;
}

// Response data interface
interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    success: boolean;
}

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://47.94.52.142::3007',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            // Add auth token if exists
            // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            // const scopedKey = user?.extends?.applicationId ? `aino_auth_token:${user?.extends?.applicationId}` : null
            const token =
                window.localStorage.getItem('aino_auth_token')
                || window.localStorage.getItem('aino_token')
                || ''
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add timestamp to prevent cache
            if (config.method === 'get') {
                config.params = {
                    ...config.params,
                    _t: Date.now(),
                };
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: AxiosError) => {
            // Handle common errors
            if (error.response?.status === 401) {
                // Unauthorized - redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('aino_auth_token');
                    window.location.href = '/auth/login';
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

// Create axios instance
const request = createAxiosInstance();

// Generic request method
const httpRequest = async <T = any>(
    config: RequestConfig
): Promise<ApiResponse<T>> => {
    try {
        const response = await request(config);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;

        // Handle network errors
        if (!axiosError.response) {
            throw new Error('Network error - please check your connection');
        }

        // Handle HTTP errors
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || axiosError.message;

        throw new Error(`Request failed (${status}): ${message}`);
    }
};

// HTTP methods
export const http = {
    // GET request
    get: <T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
        return httpRequest<T>({ ...config, method: 'GET', url });
    },

    // POST request
    post: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
        return httpRequest<T>({ ...config, method: 'POST', url, data });
    },

    // PUT request
    put: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
        return httpRequest<T>({ ...config, method: 'PUT', url, data });
    },

    // PATCH request
    patch: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
        return httpRequest<T>({ ...config, method: 'PATCH', url, data });
    },

    // DELETE request
    delete: <T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
        return httpRequest<T>({ ...config, method: 'DELETE', url });
    },

    // Upload file
    upload: <T = any>(url: string, file: File, config?: RequestConfig): Promise<ApiResponse<T>> => {
        const formData = new FormData();
        formData.append('file', file);

        return httpRequest<T>({
            ...config,
            method: 'POST',
            url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
    },

    // Download file
    download: async (url: string, filename?: string, config?: RequestConfig): Promise<void> => {
        try {
            const response = await request({
                ...config,
                method: 'GET',
                url,
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            throw new Error('Download failed');
        }
    },
};

// Export the axios instance for custom usage
export { request };

// Export types
export type { RequestConfig, ApiResponse };
