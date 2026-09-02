import { render, screen } from '@testing-library/react'
import App from './App'

test('toont de app-titel', () => {
  render(<App />)
  expect(screen.getAllByText(/automatiek/i).length).toBeGreaterThan(0)
})
