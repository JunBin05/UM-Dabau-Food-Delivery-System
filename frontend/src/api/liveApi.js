const API_BASE_URL = "http://localhost:8080/api";

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
  return fetchJson(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function putJson(path, body = {}) {
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
