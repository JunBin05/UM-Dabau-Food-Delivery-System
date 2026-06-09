const API_BASE_URL = "http://localhost:8080/api";

// Shared fetch helper so pages handle backend errors in the same way.
export function fetchJson(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  });
}

export function postJson(path, body = {}) {
  // Small wrapper for JSON POST requests.
  return fetchJson(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function putJson(path, body = {}) {
  // Small wrapper for JSON PUT requests.
  return fetchJson(path, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

export function deleteJson(path) {
  return fetchJson(path, {
    method: "DELETE"
  });
}
