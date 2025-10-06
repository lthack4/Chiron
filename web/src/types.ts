export type Status = 'not_implemented' | 'partially_implemented' | 'fully_implemented'

export interface ObjectiveDefinition {
  id: string
  text: string
}

export interface Objective extends ObjectiveDefinition {
  done: boolean
}

export interface ControlDefinition {
  id: string
  code: string
  family: string
  title: string
  description?: string
  objectives: ObjectiveDefinition[]
}

export interface Control extends ControlDefinition {
  status?: Status // undefined means "unanswered"
  objectives: Objective[]
  comment?: string
  updatedBy?: string
  updatedAt?: any
}

export interface ObjectiveState {
  id: string
  done: boolean
}

export interface ControlState {
  controlId: string
  status?: Status
  objectives?: ObjectiveState[]
  comment?: string
  updatedBy?: string
  updatedAt?: any
}

export interface BusinessMember {
  uid: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  displayName?: string
  email?: string
}

export interface BusinessInvite {
  email: string
  role: BusinessMember['role']
  invitedBy?: string
  invitedAt?: string
  status: 'pending' | 'accepted' | 'expired'
  token?: string
}

export interface BusinessInviteSummary extends BusinessInvite {
  businessId: string
  businessName: string
}

export interface Poam {
  id: string
  controlId?: string
  title: string
  owner?: string
  status: 'open' | 'in_progress' | 'completed' | 'blocked'
  riskLevel?: 'low' | 'medium' | 'high'
  dueDate?: string
  notes?: string
}

export interface Business {
  id: string
  name: string
  description?: string
  controlState: ControlState[]
  poams: Poam[]
  evidence: EvidenceDoc[]
  members?: BusinessMember[]
  invites?: BusinessInvite[]
  createdAt?: any
  updatedAt?: any
}

export interface CommentDoc {
  id?: string
  authorUid: string
  authorName?: string
  text: string
  createdAt: any
  updatedAt?: any
}

export interface EvidenceDoc {
  id?: string
  controlId: string
  storagePath: string
  filename: string
  size: number
  contentType?: string
  uploadedBy: string
  uploadedAt: any
  objectiveIds?: string[]
}
