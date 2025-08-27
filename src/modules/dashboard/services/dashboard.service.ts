import axios from 'axios'

const API_URL = 'http://localhost:3000'

export interface DashboardStats {
  totalClientes: number
  proyectosActivos: number
  totalUsuarios: number
  ingresosMes: number
}

export interface RecentProject {
  id: string
  nombre: string
  cliente: string
  estado: string
  fechaCreacion: string
}

export interface RecentActivity {
  id: string
  titulo: string
  descripcion: string
  tiempo: string
  tipo: string
}

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function getRecentProjects(token: string): Promise<RecentProject[]> {
  const response = await axios.get(`${API_URL}/dashboard/recent-projects`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function getRecentActivity(token: string): Promise<RecentActivity[]> {
  const response = await axios.get(`${API_URL}/dashboard/recent-activity`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
