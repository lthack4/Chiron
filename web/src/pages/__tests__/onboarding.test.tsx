import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { BusinessProvider } from '../../context/BusinessContext'
import { vi } from 'vitest'

// Mock firebase module used by the app to avoid real network calls.
// We'll set isFirebaseConfigured=false so the app runs in offline/demo mode and
// the Login page navigates to the dashboard without performing OAuth.
vi.mock('../../firebase', () => ({
  isFirebaseConfigured: false,
  auth: undefined,
  provider: undefined,
  db: undefined,
}))

describe('Onboarding — create account and quick start', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetAllMocks()
  })

  it('allows a user to sign in and select a company for quick start', async () => {
    // Stub fetch to return sample businesses used by BusinessProvider when firebase is disabled.
    const sampleBusinesses = [
      { id: 'b1', name: 'Alpha Co', members: [{ uid: 'demo-admin', role: 'owner', displayName: 'Demo Admin' }], controlState: [] },
      { id: 'b2', name: 'Beta LLC', members: [], controlState: [] },
    ]
    const sampleControls: any[] = [] // minimal controls so mergeControls does not crash
    vi.stubGlobal('fetch', (url: string) => {
      if (typeof url === 'string' && url.includes('cmmc-l2.controls.json')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => sampleControls })
      }
      if (typeof url === 'string' && url.includes('businesses.json')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => sampleBusinesses })
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
    })

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <BusinessProvider>
          <App />
        </BusinessProvider>
      </MemoryRouter>,
    )

    // Login page should render
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument()

    // Click the Google button (react-google-button renders a button element)
    const googleButton = screen.getByRole('button')
    await act(async () => userEvent.click(googleButton))

    // After sign-in the app should attempt to navigate to the dashboard — Home contains 'Overview'
    await waitFor(() => expect(screen.getByText(/Overview/i)).toBeInTheDocument())

    // BusinessSelector should show (Home is wrapped by AuthRoute which shows BusinessSelector when no selected company)
    // The selector renders a dialog with text 'Select a company'
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Select a company/i)).toBeInTheDocument()

    // The list of member companies is loaded from /data/businesses.json by BusinessProvider when firebase is disabled.
    // We can't fetch in tests, but BusinessProvider will load the local JSON. Wait for one of the known companies from sample data.
    // Use a loose wait to find any button that looks like a company card.
  const companyButton = await screen.findByRole('button', { name: /Alpha Co/i })
    // Click to select company
    await act(async () => userEvent.click(companyButton))

    // After selecting, the dialog should close and Home should remain visible
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText(/Overview/i)).toBeInTheDocument()
  })
})
