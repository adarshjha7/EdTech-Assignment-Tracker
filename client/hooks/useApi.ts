import { useAuth } from "../contexts/AuthContext";

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });

  };

  const get = async (url: string) => {
    const response = await apiCall(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }
    return response.json();
  };

  const post = async (url: string, data?: any) => {
    const response = await apiCall(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }
    return response.json();
  };

  const postFormData = async (url: string, formData: FormData) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }
    return response.json();
  };

  return { get, post, postFormData };
};
