import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Home from '../../app/routes/home'

// Mock the UI components
vi.mock('~/components/ui/button', () => ({
    Button: ({ children, asChild, ...props }: any) =>
        asChild ? children : React.createElement('button', props, children)
}))

vi.mock('~/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardHeader: ({ children, ...props }: any) => React.createElement('div', props, children),
    CardTitle: ({ children, ...props }: any) => React.createElement('h3', props, children),
    CardDescription: ({ children, ...props }: any) => React.createElement('p', props, children),
    CardContent: ({ children, ...props }: any) => React.createElement('div', props, children),
}))

describe('Home Component', () => {
    it('should render the welcome message', () => {
        render(React.createElement(Home))

        expect(screen.getByText('Welcome to Bistro Express')).toBeInTheDocument()
        expect(screen.getByText('Order delicious food with ease')).toBeInTheDocument()
    })

    it('should render all navigation cards', () => {
        render(React.createElement(Home))

        expect(screen.getByText('Order Food')).toBeInTheDocument()
        expect(screen.getByText('Kitchen Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })

    it('should have correct navigation links', () => {
        render(React.createElement(Home))

        const orderLink = screen.getByText('Start Ordering').closest('a')
        const dashboardLink = screen.getByText('View Dashboard').closest('a')
        const adminLink = screen.getByText('Admin Panel').closest('a')

        expect(orderLink).toHaveAttribute('href', '/order')
        expect(dashboardLink).toHaveAttribute('href', '/dashboard')
        expect(adminLink).toHaveAttribute('href', '/admin')
    })

    it('should render card descriptions', () => {
        render(React.createElement(Home))

        expect(screen.getByText('Browse our menu and place your order')).toBeInTheDocument()
        expect(screen.getByText('View and manage incoming orders')).toBeInTheDocument()
        expect(screen.getByText('Manage products and customers')).toBeInTheDocument()
    })
})