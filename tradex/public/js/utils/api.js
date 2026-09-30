// TradeX API Client Wrapper
const API = {
  getToken() {
    return localStorage.getItem('tradex_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('tradex_token', token);
    } else {
      localStorage.removeItem('tradex_token');
    }
  },

  async request(endpoint, method = 'GET', body = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`/api${endpoint}`, config);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'API Request Failed');
      }
      return data;
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, 'GET');
  },

  post(endpoint, body) {
    return this.request(endpoint, 'POST', body);
  },

  put(endpoint, body) {
    return this.request(endpoint, 'PUT', body);
  },

  patch(endpoint, body) {
    return this.request(endpoint, 'PATCH', body);
  },

  delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }
};

window.API = API;
