import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EvidenceUploader } from '../EvidenceUpload'

// Mock firebase modules
vi.mock('firebase/storage', () => {
  return {
    ref: vi.fn(() => ({})),
    uploadBytesResumable: vi.fn(() => ({
      snapshot: { ref: {} },
      on: (_state: any, _progress: any, _err: any, complete: any) => {
        // immediately call complete to simulate upload
        complete()
      }
    })),
    getDownloadURL: vi.fn(async () => 'https://example.com/file.pdf')
  }
})

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  runTransaction: vi.fn(async (_db: any, fn: any) => { await fn({ get: async () => ({ exists: () => true, data: () => ({ evidence: [] }) }), update: async () => {} }) }),
  arrayUnion: vi.fn((entry: any) => [entry])
}))

vi.mock('../../firebase', () => ({
  db: {},
  storage: {},
  isFirebaseConfigured: true,
  auth: undefined,
}))

vi.mock('../../context/AuthRoute', () => ({
  getCurrentUserID: () => 'test-user'
}))

describe('EvidenceUploader', () => {
  it('uploads file and updates firestore', async () => {
    const { container } = render(<EvidenceUploader businessId={'biz'} controlId={'ctrl'} />)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' })

    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    // wait until the upload completes and the input cleared
    await waitFor(() => expect((fileInput as HTMLInputElement).value).toBe(''))
  })
})
