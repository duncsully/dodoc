// Abstraction for all data fetching and mutations

import Pocketbase from 'pocketbase'
import type {
  TypedPocketBase,
  DocumentsRecord,
  Update,
  Collections,
  Create,
} from './pb_types'
import { effect, memo, state } from 'solit-html'

const pbBaseUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:8090'
  : window.location.origin
const pb = new Pocketbase(pbBaseUrl) as TypedPocketBase

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

// Document management --------------------------------------------------------
// For now, state management strategy is:
// * Keep a global list of all documents in memory
// * Do initial load when useSyncDocuments is first called
// * Also subscribe to changes and remain subscribed while app is running
const [documents, setDocuments] = state<DocumentsRecord[] | null>(null)

/**
 * Loads all documents and keeps them in sync via realtime subscriptions.
 * Should be called once after authenticating.
 */
export function useSyncDocuments() {
  if (!documents(false)) {
    pb.collection('documents')
      .getFullList({
        sort: '-created',
      })
      .then(setDocuments)
  }

  effect(function subscribeToDocuments() {
    pb.collection('documents').subscribe('*', (e) => {
      const docs = documents(false) ?? []
      const index = docs.findIndex((d) => d.id === e.record.id)

      let newDocs = [...docs]
      if (e.action === 'create') {
        newDocs.unshift(e.record)
      } else if (e.action === 'update' && index !== -1) {
        newDocs[index] = e.record
      } else if (e.action === 'delete' && index !== -1) {
        newDocs.splice(index, 1)
      }
      setDocuments(newDocs)
    })

    return () => {
      pb.collection('documents').unsubscribe('*')
      setDocuments([])
    }
  })
}

export function useDocuments() {
  return documents
}

export function useDocument(id: () => string) {
  return memo(() => documents()?.find((d) => d.id === id()))
}

export function createDocument(data: Create<Collections.Documents>) {
  return pb
    .collection('documents')
    .create({ ...data, owner: pb.authStore.record?.id })
}

export function updateDocument(
  id: string,
  data: Update<Collections.Documents>
) {
  return pb.collection('documents').update(id, data)
}

export function deleteDocument(id: string) {
  return pb.collection('documents').delete(id)
}
