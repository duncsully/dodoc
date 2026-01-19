// Abstraction for all data fetching and mutations

import Pocketbase from 'pocketbase'
import type { TypedPocketBase } from './pb_types'
import { state } from 'solit-html'

const pb = new Pocketbase('http://127.0.0.1:8090') as TypedPocketBase

const [_isLoggedIn, setIsLoggedIn] = state(false)
pb.authStore.onChange(() => {
  setIsLoggedIn(pb.authStore.isValid)
}, true)

export const isLoggedIn = _isLoggedIn

export const signUp = async (email: string, password: string) => {
  await pb
    .collection('users')
    .create({ email, password, passwordConfirm: password })

  // For now, auto-login after sign-up. This may change in the future.
  return await login(email, password)
}

export const login = async (email: string, password: string) => {
  return await pb.collection('users').authWithPassword(email, password)
}

export const logout = () => {
  pb.authStore.clear()
}
