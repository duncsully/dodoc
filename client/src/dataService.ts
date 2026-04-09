import Pocketbase from 'pocketbase'
import {
  type TypedPocketBase,
  type Update,
  Collections,
  type Create,
  type UsersRecord,
  type DocumentsResponse,
  type UsersResponse,
  type RemindersResponse,
  type CollectionResponses,
} from './pb_types'
import { memo, state, watch } from 'solit-html'
import { registerPushNotifications } from './utils'

/**
 * About data management
 *
 * This module's intention is to abstract data fetching and mutations from the client.
 *
 * It uses an approach similar to Tanstack DB in that the various tables are fully loaded
 * into record signals at the module level, which are loaded and unloaded when the user logs
 * in and out respectively. Various other state is derived from these signals as needed,
 * such as a sorted and filtered documents list.
 */

const pbBaseUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:8090'
  : window.location.origin
const pb = new Pocketbase(pbBaseUrl) as TypedPocketBase

// Auth and users -------------------------------------------------------------

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

export const sendTestPush = async () => {
  await registerPushNotifications()
  await pb.send('/api/test-notification', { method: 'POST' })
}

// The Tanstack DB we have at home
/**
 * Create a signal for a PocketBase collection as a record of IDs to rows
 * @param collection
 * @returns
 */
function collectionSignal<T extends Collections>(collection: T) {
  const [data, setData] = state<Record<string, CollectionResponses[T]> | null>(
    null
  )

  watch(() => {
    if (isLoggedIn()) {
      pb.collection(collection)
        .getFullList()
        .then((newData) => {
          setData(Object.fromEntries(newData.map((item) => [item.id, item])))
        })
      pb.collection(collection).subscribe('*', (e) => {
        const current = data(false) ?? {}

        const newData = { ...current }
        if (['create', 'update'].includes(e.action)) {
          newData[e.record.id] = e.record
        } else if (e.action === 'delete') {
          delete newData[e.record.id]
        }
        setData(newData)
      })
    } else {
      pb.collection(collection).unsubscribe('*')
      setData(null)
    }
  })

  return data
}

const documents = collectionSignal(Collections.Documents)
const visibleUsers = collectionSignal(Collections.Users)
const reminders = collectionSignal(Collections.Reminders)

export const users = memo(() => {
  const users = visibleUsers()
  if (!users) return undefined
  return Object.values(users).filter(
    (user) => user.id !== pb.authStore.record?.id
  )
})

export const getUserAvatarUrl = (user: Pick<UsersRecord, 'avatar'>) => {
  if (user.avatar) {
    return pb.files.getURL(user, user.avatar)
  }
  return 'https://ionicframework.com/docs/img/demos/avatar.svg'
}

export const registerPushSubscription = (subscription: PushSubscription) => {
  return pb.collection('push_subscriptions').create({
    user: pb.authStore.record?.id,
    subscription: subscription.toJSON(),
  })
}

export const getVapidKey = async () => {
  const record = await pb.collection('key_values').getOne('vapid_public_key')
  return record.value
}

// Document management --------------------------------------------------------

/**
 * Document type with owner and reminder relationships
 */
export type Document = Omit<DocumentsResponse, 'owner' | 'reminder'> & {
  owner?: UsersResponse
  reminder?: RemindersResponse
}

const fullDocuments = memo(() => {
  return Object.fromEntries(
    Object.entries(documents() ?? {}).map(([id, doc]) => [
      id,
      {
        ...doc,
        owner: visibleUsers()?.[doc.owner],
        reminder: Object.values(reminders() ?? {}).find(
          (r) => r.document === doc.id
        ),
      } satisfies Document,
    ])
  )
})

const sortedDocuments = memo(() =>
  Object.values(fullDocuments()).sort((a, b) => {
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

export function useDocuments() {
  return visibleDocuments
}

export function useDocument(id: () => string) {
  return memo(() => fullDocuments()?.[id()])
}

async function setReminder(docId: string, reminder?: string | null) {
  if (reminder === undefined) return

  const existingReminder = fullDocuments()?.[docId].reminder

  if (!existingReminder && !reminder) {
    return
  }
  if (!existingReminder && reminder) {
    return await pb.collection('reminders').create({
      document: docId,
      start: reminder,
      user: pb.authStore.record?.id,
    })
  }
  if (existingReminder && !reminder) {
    return await pb.collection('reminders').delete(existingReminder.id)
  }
  if (existingReminder && existingReminder.start !== reminder) {
    return await pb
      .collection('reminders')
      .update(existingReminder.id, { start: reminder })
  }
  // Not changed, do nothing
}

export async function createDocument(
  data: Create<Collections.Documents> & { reminder: string | null }
) {
  const { reminder, ...docData } = data
  const newDoc = await pb
    .collection('documents')
    .create({ ...docData, owner: pb.authStore.record?.id })
  await setReminder(newDoc.id, reminder)
  return newDoc
}

export function updateDocument(
  id: string,
  data: Update<Collections.Documents> & { reminder?: string | null }
) {
  const { reminder, ...docData } = data
  return Promise.all([
    pb.collection('documents').update(id, docData),
    setReminder(id, reminder),
  ])
}

export function deleteDocument(id: string) {
  return pb.collection('documents').delete(id)
}
