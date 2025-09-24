import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SidebarShell from '../SidebarShell'

describe('SidebarShell', () => {
  it('renders title, children, and admin badge', () => {
    render(
      <MemoryRouter>
        <SidebarShell title="Controls">
          <div>content-here</div>
        </SidebarShell>
      </MemoryRouter>
    )
    expect(screen.getByText(/content-here/i)).toBeInTheDocument()
    expect(screen.getByText(/Administrator/i)).toBeInTheDocument()
    // nav links should exist
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })
})
