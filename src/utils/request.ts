type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  url: string
  method?: Method
  data?: Record<string, unknown>
  header?: Record<string, string>
}

const BASE_URL = 'https://api.example.com'

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data = {}, header = {} } = options
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        const { statusCode, data: responseData } = res
        
        if (statusCode === 200) {
          resolve(responseData as T)
        } else {
          reject(new Error(`请求失败，状态码: ${statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export function get<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>({ url, method: 'GET', data })
}

export function post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>({ url, method: 'POST', data })
}

export function put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>({ url, method: 'PUT', data })
}

export function del<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  return request<T>({ url, method: 'DELETE', data })
}
