import axios from 'axios'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://ue-cheguevara-backend-1.onrender.com/api/v1',

  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
  timeout: 45000, // 45s para acomodar cold starts en Render Free Tier
})

let coldStartToastId: string | number | null = null;

api.interceptors.request.use((config) => {
  // Detector de cold-start: si la petición tarda más de 3 segundos, alertar al usuario amistosamente
  const timer = setTimeout(() => {
    if (!coldStartToastId) {
      coldStartToastId = toast.loading(
        'El servidor escolar se está iniciando (arranque en frío Render). Un momento por favor...',
        { duration: 15000 },
      );
    }
  }, 3500);

  (config as any)._coldStartTimer = timer;
  return config;
});

let isRefreshing = false

let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (
  error: unknown,
  token: string | null = null,
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

const kickUserOut = () => {
  localStorage.removeItem('uecg_user')

  document.cookie =
    'uecg_is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

  if (
    window.location.pathname !== '/' &&
    window.location.pathname !== '/login'
  ) {
    window.location.href = '/'
  }
}

api.interceptors.response.use(
  (response) => {
    if ((response.config as any)?._coldStartTimer) {
      clearTimeout((response.config as any)._coldStartTimer);
    }
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }

    // Si la respuesta NestJS tiene un wrapper .data.data, lo desempaquetamos centralizadamente
    if (response.data && response.data.data !== undefined) {
      // Solo preservamos la estructura si hay metadata de paginación real (ej. total, totalPages, page, limit)
      const hasPagination =
        response.data.meta !== undefined &&
        (response.data.meta.total !== undefined ||
          response.data.meta.totalPages !== undefined ||
          response.data.meta.page !== undefined ||
          response.data.meta.limit !== undefined);

      if (hasPagination) {
        response.data = { data: response.data.data, meta: response.data.meta };
      } else {
        response.data = response.data.data;
      }
    }
    return response;
  },


  async (error) => {
    if ((error.config as any)?._coldStartTimer) {
      clearTimeout((error.config as any)._coldStartTimer);
    }
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (originalRequest.url === '/auth/refresh') {
        kickUserOut()

        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true

      isRefreshing = true

      try {
        await api.post('/auth/refresh')

        processQueue(null)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)

        kickUserOut()

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
