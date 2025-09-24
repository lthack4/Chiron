import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  type DocumentData,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

import type {
  Business,
  BusinessInvite,
  BusinessInviteSummary,
  BusinessMember,
  Control,
  ControlDefinition,
  ControlState,
  Objective,
  ObjectiveState,
} from '../types'
import { auth as firebaseAuth, db, isFirebaseConfigured } from '../firebase'
import { getCurrentUserID } from './AuthRoute'

const STORAGE_KEY = 'chiron:selectedBusinessId'
const USER_STORAGE_KEY = 'chiron:demoUserId'
const DEMO_DEFAULT_UID = 'demo-admin'

interface BusinessContextValue {
  loading: boolean
  error: Error | null
  currentUserId: string | null
  isPlatformAdmin: boolean
  controlDefinitions: ControlDefinition[]
  businesses: Business[]
  memberBusinesses: Business[]
  discoverableBusinesses: Business[]
  selectedBusinessId: string | null
  selectedBusiness: Business | null
  membershipForSelected: BusinessMember | null
  pendingInvites: BusinessInviteSummary[]
  canCreateBusiness: boolean
  canManageSelected: boolean
  controls: Control[]
  selectBusiness: (businessId: string) => void
  clearSelectedBusiness: () => void
  updateControl: (control: Control, metadata?: Partial<Pick<ControlState, 'updatedAt' | 'updatedBy'>>) => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

export function BusinessProvider({ children }: PropsWithChildren) {
  const [controlDefinitions, setControlDefinitions] = useState<ControlDefinition[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loadingDefinitions, setLoadingDefinitions] = useState(true)
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => resolveCurrentUserId())
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored || null
  })

  useEffect(() => {
    let cancelled = false

    async function loadControlDefinitions() {
      setLoadingDefinitions(true)
      try {
        const response = await fetch('/data/cmmc-l2.controls.json')
        if (!response.ok) {
          throw new Error(`Failed to load control definitions (${response.status})`)
        }
        const definitions: ControlDefinition[] = await response.json()
        if (!cancelled) {
          setControlDefinitions(definitions)
        }
      } catch (err) {
        console.error('Failed to load control definitions', err)
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoadingDefinitions(false)
        }
      }
    }

    loadControlDefinitions()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (firebaseAuth) {
      return onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUserId(user?.uid ?? resolveCurrentUserId())
      })
    }
  }, [])

  useEffect(() => {
    setCurrentUserId(resolveCurrentUserId())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: StorageEvent) => {
      if (event.key === USER_STORAGE_KEY) {
        setCurrentUserId(resolveCurrentUserId())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedBusinessId) {
      window.localStorage.setItem(STORAGE_KEY, selectedBusinessId)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [selectedBusinessId])

  const useFirebase = Boolean(isFirebaseConfigured && db)

  useEffect(() => {
    if (!useFirebase || !db) {
      let cancelled = false
      setLoadingBusinesses(true)

      async function loadStaticBusinesses() {
        try {
          const response = await fetch('/data/businesses.json')
          if (!response.ok) {
            throw new Error(`Failed to load business data (${response.status})`)
          }
          const businessDocs: Business[] = await response.json()
          if (!cancelled) {
            setBusinesses(businessDocs)
            setError(null)
          }
        } catch (err) {
          console.error('Failed to load business data', err)
          if (!cancelled) {
            setError(err as Error)
          }
        } finally {
          if (!cancelled) {
            setLoadingBusinesses(false)
          }
        }
      }

      loadStaticBusinesses()

      return () => {
        cancelled = true
      }
    }

    if (!db) {
      setLoadingBusinesses(false)
      return
    }

    setLoadingBusinesses(true)
    setError(null)

    const businessesRef = collection(db, 'businesses')
    const unsubscribe = onSnapshot(
      businessesRef,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnapshot) => normalizeBusinessDoc(docSnapshot.id, docSnapshot.data()))
        setBusinesses(docs)
        setLoadingBusinesses(false)
      },
      (err) => {
        console.error('Failed to subscribe to businesses', err)
        setError(err as Error)
        setLoadingBusinesses(false)
      },
    )

    return () => unsubscribe()
  }, [useFirebase, db])

  const loading = loadingDefinitions || loadingBusinesses

  const memberBusinesses = useMemo(() => {
    if (!currentUserId) return []
    return businesses.filter(business => hasMembership(business, currentUserId))
  }, [businesses, currentUserId])

  const isPlatformAdmin = useMemo(() => {
    if (!currentUserId) return false
    return memberBusinesses.some(business => hasRole(business, currentUserId, ['owner', 'admin']))
  }, [memberBusinesses, currentUserId])

  const discoverableBusinesses = useMemo(() => {
    if (!isPlatformAdmin) return []
    const memberIds = new Set(memberBusinesses.map(b => b.id))
    return businesses.filter(business => !memberIds.has(business.id))
  }, [businesses, memberBusinesses, isPlatformAdmin])

  useEffect(() => {
    if (!selectedBusinessId) return
    const accessible = [...memberBusinesses, ...discoverableBusinesses].some(b => b.id === selectedBusinessId)
    if (!accessible) {
      setSelectedBusinessId(null)
    }
  }, [memberBusinesses, discoverableBusinesses, selectedBusinessId])

  const selectedBusiness = useMemo(() => {
    if (!selectedBusinessId) return null
    return businesses.find(business => business.id === selectedBusinessId) ?? null
  }, [businesses, selectedBusinessId])

  const membershipForSelected = useMemo(() => {
    if (!selectedBusiness || !currentUserId) return null
    return selectedBusiness.members?.find(member => member.uid === currentUserId) ?? null
  }, [selectedBusiness, currentUserId])

  const pendingInvites = useMemo(() => {
    if (!isPlatformAdmin) return []
    const result: BusinessInviteSummary[] = []
    for (const business of businesses) {
      for (const invite of business.invites ?? []) {
        if (invite.status === 'pending') {
          result.push({ ...invite, businessId: business.id, businessName: business.name })
        }
      }
    }
    return result
  }, [businesses, isPlatformAdmin])

  const canCreateBusiness = isPlatformAdmin

  const controls = useMemo(() => {
    if (!selectedBusiness) return []
    return mergeControls(controlDefinitions, selectedBusiness.controlState)
  }, [controlDefinitions, selectedBusiness])

  const canAccessBusiness = useCallback((businessId: string) => {
    if (!currentUserId) return false
    if (isPlatformAdmin) {
      return businesses.some(b => b.id === businessId)
    }
    return memberBusinesses.some(b => b.id === businessId)
  }, [businesses, currentUserId, isPlatformAdmin, memberBusinesses])

  const selectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessId(prev => (canAccessBusiness(businessId) ? businessId : prev))
  }, [canAccessBusiness])

  const clearSelectedBusiness = useCallback(() => {
    setSelectedBusinessId(null)
  }, [])

  const canManageSelected = useMemo(() => {
    if (!selectedBusiness) return false
    if (isPlatformAdmin) return true
    if (!membershipForSelected) return false
    return ['owner', 'admin', 'editor'].includes(membershipForSelected.role)
  }, [selectedBusiness, isPlatformAdmin, membershipForSelected])

  const updateControl = useCallback(async (control: Control, metadata?: Partial<Pick<ControlState, 'updatedAt' | 'updatedBy'>>) => {
    if (!selectedBusinessId || !canManageSelected) return

    const optimisticUpdatedAt = metadata?.updatedAt ?? new Date().toISOString()
    const nextState = controlToState(control, { ...metadata, updatedAt: optimisticUpdatedAt })

    setBusinesses(prev => prev.map(business => {
      if (business.id !== selectedBusinessId) return business
      return {
        ...business,
        controlState: upsertControlState(business.controlState, nextState),
        updatedAt: optimisticUpdatedAt,
      }
    }))

    if (!useFirebase || !db) return

    try {
      const businessRef = doc(db, 'businesses', selectedBusinessId)
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(businessRef)
        if (!snapshot.exists()) {
          throw new Error('Business not found')
        }
        const existing = normalizeBusinessDoc(snapshot.id, snapshot.data())
        const mergedState = upsertControlState(existing.controlState, nextState)

        transaction.update(businessRef, {
          controlState: mergedState,
          updatedAt: optimisticUpdatedAt,
        })
      })
    } catch (err) {
      console.error('Failed to update control state in Firestore', err)
      setError(err as Error)
    }
  }, [selectedBusinessId, canManageSelected, useFirebase])

  const value = useMemo<BusinessContextValue>(() => ({
    loading,
    error,
    currentUserId,
    isPlatformAdmin,
    controlDefinitions,
    businesses,
    memberBusinesses,
    discoverableBusinesses,
    selectedBusinessId,
    selectedBusiness,
    membershipForSelected,
    pendingInvites,
    canCreateBusiness,
    canManageSelected,
    controls,
    selectBusiness,
    clearSelectedBusiness,
    updateControl,
  }), [
    loading,
    error,
    currentUserId,
    isPlatformAdmin,
    controlDefinitions,
    businesses,
    memberBusinesses,
    discoverableBusinesses,
    selectedBusinessId,
    selectedBusiness,
    membershipForSelected,
    pendingInvites,
    canCreateBusiness,
    canManageSelected,
    controls,
    selectBusiness,
    clearSelectedBusiness,
    updateControl,
  ])

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinessContext() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider')
  }
  return context
}

function mergeControls(definitions: ControlDefinition[], states: ControlState[]): Control[] {
  const stateMap = new Map(states.map(state => [state.controlId, state]))

  return definitions.map(definition => {
    const state = stateMap.get(definition.id)
    const objectives: Objective[] = definition.objectives.map(obj => ({
      ...obj,
      done: findObjectiveDone(state?.objectives, obj.id),
    }))

    return {
      ...definition,
      status: state?.status,
      comment: state?.comment,
      updatedBy: state?.updatedBy,
      updatedAt: state?.updatedAt,
      objectives,
    }
  })
}

function upsertControlState(entries: ControlState[], next: ControlState): ControlState[] {
  const index = entries.findIndex(entry => entry.controlId === next.controlId)
  if (index === -1) {
    return [...entries, next]
  }
  const nextEntries = [...entries]
  nextEntries[index] = {
    ...nextEntries[index],
    ...next,
    objectives: mergeObjectiveStates(nextEntries[index].objectives, next.objectives),
  }
  return nextEntries
}

function mergeObjectiveStates(current?: ObjectiveState[], incoming?: ObjectiveState[]): ObjectiveState[] | undefined {
  if (!incoming) return current
  if (!current) return incoming

  const results = new Map<string, ObjectiveState>()
  for (const entry of current) {
    results.set(entry.id, entry)
  }
  for (const entry of incoming) {
    results.set(entry.id, entry)
  }
  return Array.from(results.values())
}

function controlToState(control: Control, metadata?: Partial<Pick<ControlState, 'updatedAt' | 'updatedBy'>>): ControlState {
  return {
    controlId: control.id,
    status: control.status,
    comment: control.comment,
    objectives: control.objectives.map(objective => ({ id: objective.id, done: objective.done })),
    updatedBy: metadata?.updatedBy ?? control.updatedBy,
    updatedAt: metadata?.updatedAt ?? control.updatedAt ?? new Date().toISOString(),
  }
}

function findObjectiveDone(entries: ObjectiveState[] | undefined, id: string): boolean {
  if (!entries) return false
  const match = entries.find(entry => entry.id === id)
  return match ? Boolean(match.done) : false
}

function resolveCurrentUserId(): string | null {
  const authUid = getCurrentUserID()
  if (authUid) return authUid
  if (isFirebaseConfigured) return null
  if (typeof window === 'undefined') return DEMO_DEFAULT_UID
  const stored = window.localStorage.getItem(USER_STORAGE_KEY)
  return stored || DEMO_DEFAULT_UID
}

function hasMembership(business: Business, uid: string): boolean {
  return Boolean(business.members?.some(member => member.uid === uid))
}

function hasRole(business: Business, uid: string, roles: BusinessMember['role'][]): boolean {
  return Boolean(business.members?.some(member => member.uid === uid && roles.includes(member.role)))
}

function normalizeBusinessDoc(id: string, data: DocumentData | undefined): Business {
  const base = (data ?? {}) as Partial<Business>
  return {
    id,
    name: base.name ?? 'Untitled company',
    description: base.description ?? '',
    controlState: Array.isArray(base.controlState) ? base.controlState as ControlState[] : [],
    poams: Array.isArray(base.poams) ? base.poams : [],
    evidence: Array.isArray(base.evidence) ? base.evidence : [],
    members: Array.isArray(base.members) ? base.members : [],
    invites: Array.isArray(base.invites) ? base.invites : [],
    createdAt: base.createdAt ?? null,
    updatedAt: base.updatedAt ?? null,
  }
}
