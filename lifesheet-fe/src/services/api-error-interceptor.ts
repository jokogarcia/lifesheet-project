import type { Axios } from "axios";
import posthog from "posthog-js";

export function setupApiErrorInterceptor(client: Axios) {
    client.interceptors.response.use(
        response => response,
        error => {
            posthog.capture('api_error', { endpoint: error.config?.url, status: error.response?.status, message: error.message });
            return Promise.reject(error);
        }
    );
}