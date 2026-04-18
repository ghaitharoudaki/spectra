import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function runScan(url, mode = 'full') {
  const { data } = await api.post('/scan', { url, mode })
  return data
}