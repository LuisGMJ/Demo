import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001/api/'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getEquipments = async () => {
  try {
    const response = await api.get('equipments')
    return response.data
  } catch (error) {
    console.error('Error al obtener equipos:', error)
    throw error
  }
}

export const addEquipment = async (form) => {
  try {
    const response = await api.post('equipments', form)
    return response.data
  } catch (error) {
    console.error('Error al obtener equipos:', error)
    throw error
  }
}

export const updateEquipment = async (id, updatedData) => {
  try {
    const response = await api.put(`equipments/${id}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error al actualizar equipo:', error)
    throw error
  }
}

export const deleteEquipment = async (id) => {
  try {
    const response = await api.delete(`equipments/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al borrar equipo:', error)
    throw error
  }
}

export default api
