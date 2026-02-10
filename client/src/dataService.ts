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

export const updateUser = async (data: Update<Collections.Users>) => {
  if (!pb.authStore.record) throw new Error('Not authenticated')
  return await pb.collection('users').update(pb.authStore.record.id, data)
}

export const myUser = () => {
  return pb.authStore.record
}

export const myAvatarUrl = () => {
  const user = pb.authStore.record
  if (user?.avatar) {
    return pb.files.getURL(user, user.avatar)
  }
  return 'https://ionicframework.com/docs/img/demos/avatar.svg'
}

export const useUsers = () => {
  return pb.collection('users').getFullList({
    sort: 'email',
    filter: `emailVisibility=true && id!="${pb.authStore.record?.id}"`,
  })
}

export const getUserAvatarUrl = (user: Pick<UsersRecord, 'avatar'>) => {
  if (user.avatar) {
    return pb.files.getURL(user, user.avatar)
  }
  return 'https://ionicframework.com/docs/img/demos/avatar.svg'
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

const [documents, setDocuments] = state<Record<
  string,
  DocumentWithExpand
> | null>(null)

const sortedDocuments = memo(() =>
  Object.values(documents() ?? {}).sort((a, b) => {
    return new Date(b.updated).getTime() - new Date(a.updated).getTime()
  })
)

export const [searchQuery, setSearchQuery] = state('')

const visibleDocuments = memo(() => {
  const docs = sortedDocuments()
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
      .then((docs) => {
        const docsById = docs.reduce((acc, doc) => {
          acc[doc.id] = doc
          return acc
        }, {} as Record<string, DocumentWithExpand>)
        setDocuments(docsById)
      })
  }

  effect(function subscribeToDocuments() {
    pb.collection('documents').subscribe<DocumentWithExpand>(
      '*',
      (e) => {
        const docs = documents(false) ?? {}

        const newDocs = { ...docs }
        if (['create', 'update'].includes(e.action)) {
          newDocs[e.record.id] = e.record
        } else if (e.action === 'delete') {
          delete newDocs[e.record.id]
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
      setDocuments({})
    }
  })
}

export function useDocuments() {
  return visibleDocuments
}

export function useDocument(id: () => string) {
  return memo(() => documents()?.[id()])
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
