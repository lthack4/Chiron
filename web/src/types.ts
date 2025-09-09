export type Status = 'not_implemented' | 'partially_implemented' | 'fully_implemented'

export interface Objective {
  id: string
  text: string
  done: boolean
}

export interface Control {
  id: string
  code: string
  family: string
  title: string
  description?: string
  status?: Status // undefined means "unanswered"
  objectives: Objective[]
  comment?: string
  updatedBy?: string
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
