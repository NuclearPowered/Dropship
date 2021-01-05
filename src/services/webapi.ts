import axios from 'axios'
import { WEBAPI_URL } from '@/consts'
import store from '@/store'

export default function webapi () {
  return axios.create({
    baseURL: WEBAPI_URL,
    timeout: 10000,
    headers: { Authorization: `Bearer ${store.state.auth.jwt}` }
  })
}
