const API_URL = "http://localhost:5000/api/v1";

interface FetchOptions {
    method?: string;
    body?: any;
    token?: string | null;
    isFormData?: boolean;
}

export async function api<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { method = "GET", body, token, isFormData = false } = options;

    const headers: Record<string, string> = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
}
