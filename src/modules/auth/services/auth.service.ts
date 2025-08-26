import axios from 'axios'
import type { LoginDto } from '../dto/login.dto'
import type { User } from '../interfaces/user.interface'

const API_URL = 'http://localhost:3000/auth'

export async function login(dto: LoginDto): Promise<{ accessToken: string; usuario: User }> {
  const response = await axios.post(`${API_URL}/login`, dto)
  return response.data
}

export async function getProfile(token: string): Promise<User> {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
