// Abstraction for all data fetching and mutations

import Pocketbase from 'pocketbase'
import type {
  TypedPocketBase,
  Update,
  Collections,
  Create,
  UsersRecord,
  DocumentsResponse,
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

export const useMe = () => {
  return pb.authStore.record
}

export const useUsers = () => {
  return pb.collection('users').getFullList({
    sort: 'email',
    filter: `emailVisibility=true && id!="${pb.authStore.record?.id}"`,
  })
}

// Document management --------------------------------------------------------
// For now, state management strategy is:
// * Keep a global list of all documents in memory
// * Do initial load when useSyncDocuments is first called
// * Also subscribe to changes and remain subscribed while app is running

type DocumentExpand = {
  owner: Pick<UsersRecord, 'id' | 'name' | 'email'>
}
type DocumentWithExpand = DocumentsResponse<DocumentExpand>

// Alias for external usage
export type Document = DocumentWithExpand

const [documents, setDocuments] = state<DocumentWithExpand[] | null>(null)

export const [searchQuery, setSearchQuery] = state('')

const visibleDocuments = memo(() => {
  const docs = documents()
  const query = searchQuery().toLowerCase()

  if (!docs) return null
  if (!query) return docs

  return docs.filter((d) => {
    return (
      d.title.toLowerCase().includes(query) ||
      d.content.toLowerCase().includes(query)
    )
  })
})

/**
 * Loads all documents and keeps them in sync via realtime subscriptions.
 * Should be called once after authenticating.
 */
export function useSyncDocuments() {
  if (!documents(false)) {
    pb.collection('documents')
      .getFullList<DocumentWithExpand>({
        sort: '-created',
        expand: 'owner',
        fields: '*,expand.owner.id,expand.owner.name,expand.owner.email',
      })
      .then(setDocuments)
  }

  effect(function subscribeToDocuments() {
    pb.collection('documents').subscribe<DocumentWithExpand>(
      '*',
      (e) => {
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
      },
      {
        expand: 'owner',
        fields: '*,expand.owner.id,expand.owner.name,expand.owner.email',
      }
    )

    return () => {
      pb.collection('documents').unsubscribe('*')
      setDocuments([])
    }
  })
}

export function useDocuments() {
  return visibleDocuments
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
