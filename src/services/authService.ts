import { GenericResponse, GenericResponseWithData } from '@/services/responses/genericResponse'
import AuthResponse from '@/services/responses/authResponse'
import store from '@/store'
import webapi from '@/services/webapi'

export default class AuthService {
  static async login (username: string,
    password: string): Promise<GenericResponseWithData<AuthResponse> | GenericResponse> {
    const response: GenericResponseWithData<AuthResponse>
                  | GenericResponse = (await webapi().post('/api/auth/login', {
                    username,
                    password
                  })).data

    if (response.success) {
      await store.dispatch('login', (response as GenericResponseWithData<AuthResponse>).data.token)
      return response
    }
    return response
  }

  static async logout () {
    await store.dispatch('logout')
  }
}
