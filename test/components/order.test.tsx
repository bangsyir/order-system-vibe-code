import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Order from '../../app/routes/order'
import { useLoaderData } from 'react-router'

// Mock the UI components
vi.mock('~/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, variant, ...props }: any) =>
        <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
            {children}
        </button>
}))

vi.mock('~/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Plus: () => <span data-testid="plus-icon">+</span>,
    Minus: () => <span data-testid="minus-icon">-</span>,
    ShoppingCart: () => <span data-testid="cart-icon">🛒</span>,
}))

const mockCategories = [
    {
        id: 'cat1',
        name: 'Main Courses',
        description: 'Hearty main dishes',
        products: [
            {
                id: 'prod1',
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato and mozzarella',
                price: 18.99,
                available: true,
            },
            {
                id: 'prod2',
                name: 'Grilled Salmon',
                description: 'Fresh Atlantic salmon',
                price: 24.99,
                available: true,
            },
        ],
    },
    {
        id: 'cat2',
        name: 'Appetizers',
        description: 'Start your meal',
        products: [
            {
                id: 'prod3',
                name: 'Caesar Salad',
                description: 'Fresh romaine lettuce',
                price: 12.99,
                available: true,
            },
        ],
    },
]

describe('Order Component', () => {
    beforeEach(() => {
        vi.mocked(useLoaderData).mockReturnValue({
            categories: mockCategories,
        })
    })

    it('should render menu categories and products', () => {
        render(<Order loaderData={{ categories: mockCategories }} />)

        expect(screen.getByText('Main Courses')).toBeInTheDocument()
        expect(screen.getByText('Appetizers')).toBeInTheDocument()
        expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
        expect(screen.getByText('Grilled Salmon')).toBeInTheDocument()
        expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    })

    it('should display product prices correctly', () => {
        render(<Order loaderData={{ categories: mockCategories }} />)

        expect(screen.getByText('$18.99')).toBeInTheDocument()
        expect(screen.getByText('$24.99')).toBeInTheDocument()
        expect(screen.getByText('$12.99')).toBeInTheDocument()
    })

    it('should render order type selection', () => {
        render(<Order loaderData={{ categories: mockCategories }} />)

        expect(screen.getByText('Dine In')).toBeInTheDocument()
        expect(screen.getByText('Takeaway')).toBeInTheDocument()
    })

    it('should show table number input when dine-in is selected', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        // Dine In should be selected by default
        expect(screen.getByPlaceholderText('Enter table number')).toBeInTheDocument()
    })

    it('should hide table number input when takeaway is selected', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        const takeawayButton = screen.getByText('Takeaway')
        await user.click(takeawayButton)

        expect(screen.queryByPlaceholderText('Enter table number')).not.toBeInTheDocument()
    })

    it('should add items to cart when plus button is clicked', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        const plusButtons = screen.getAllByTestId('plus-icon')
        await user.click(plusButtons[0]) // Add first product

        // Should show quantity in cart
        expect(screen.getByText('Your Order (1)')).toBeInTheDocument()
        expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })

    it('should calculate total price correctly', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        const plusButtons = screen.getAllByTestId('plus-icon')
        await user.click(plusButtons[0]) // Add pizza ($18.99)
        await user.click(plusButtons[1]) // Add salmon ($24.99)

        // Total should be $43.98
        expect(screen.getByText('$43.98')).toBeInTheDocument()
    })

    it('should remove items from cart when minus button is clicked', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        const plusButtons = screen.getAllByTestId('plus-icon')
        await user.click(plusButtons[0]) // Add pizza
        await user.click(plusButtons[0]) // Add pizza again (quantity: 2)

        expect(screen.getByText('Your Order (2)')).toBeInTheDocument()

        // Now remove one
        const minusButtons = screen.getAllByTestId('minus-icon')
        await user.click(minusButtons[0])

        expect(screen.getByText('Your Order (1)')).toBeInTheDocument()
    })

    it('should disable place order button when cart is empty', () => {
        render(<Order loaderData={{ categories: mockCategories }} />)

        const placeOrderButton = screen.getByText('Place Order')
        expect(placeOrderButton).toBeDisabled()
    })

    it('should disable place order button when dine-in selected but no table number', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        // Add item to cart
        const plusButtons = screen.getAllByTestId('plus-icon')
        await user.click(plusButtons[0])

        // Place order should still be disabled (no table number)
        const placeOrderButton = screen.getByText('Place Order')
        expect(placeOrderButton).toBeDisabled()
    })

    it('should enable place order button when cart has items and table number is provided', async () => {
        const user = userEvent.setup()
        render(<Order loaderData={{ categories: mockCategories }} />)

        // Add item to cart
        const plusButtons = screen.getAllByTestId('plus-icon')
        await user.click(plusButtons[0])

        // Enter table number
        const tableInput = screen.getByPlaceholderText('Enter table number')
        await user.type(tableInput, '5')

        // Place order should now be enabled
        const placeOrderButton = screen.getByText('Place Order')
        expect(placeOrderButton).not.toBeDisabled()
    })

    it('should show empty cart message when no items added', () => {
        render(<Order loaderData={{ categories: mockCategories }} />)

        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
})