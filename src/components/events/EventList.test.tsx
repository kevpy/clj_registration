import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EventList } from './EventList';

// Mock the useQuery hook
vi.mock('convex/react', () => ({
    useQuery: vi.fn(),
}));

import { useQuery } from 'convex/react';

describe('EventList', () => {
    const mockEvents = [
        {
            _id: '1',
            name: 'Event 1',
            date: '2023-10-27',
            startTime: '10:00',
            endTime: '12:00',
            location: 'Hall A',
            description: 'Description 1',
            isActive: true,
            attendedCount: 10,
            maxCapacity: 100,
        },
        {
            _id: '2',
            name: 'Event 2',
            date: '2023-10-28',
            isActive: false,
            attendedCount: 5,
        },
    ];

    const mockOnSelectEvent = vi.fn();
    const mockOnToggleStatus = vi.fn();

    it('renders list of events', () => {
        render(
            <EventList
                events={mockEvents}
                selectedEvent={null}
                onSelectEvent={mockOnSelectEvent}
                onToggleStatus={mockOnToggleStatus}
            />
        );

        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('calls onSelectEvent when view details button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <EventList
                events={mockEvents}
                selectedEvent={null}
                onSelectEvent={mockOnSelectEvent}
                onToggleStatus={mockOnToggleStatus}
            />
        );

        const viewDetailsButtons = screen.getAllByText('View Details');
        await user.click(viewDetailsButtons[0]);

        expect(mockOnSelectEvent).toHaveBeenCalledWith('1');
    });

    it('calls onToggleStatus when activate/deactivate button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <EventList
                events={mockEvents}
                selectedEvent={null}
                onSelectEvent={mockOnSelectEvent}
                onToggleStatus={mockOnToggleStatus}
            />
        );

        const deactivateButton = screen.getByText('Deactivate');
        await user.click(deactivateButton);

        expect(mockOnToggleStatus).toHaveBeenCalledWith('1', true);

        const activateButton = screen.getByText('Activate');
        await user.click(activateButton);

        expect(mockOnToggleStatus).toHaveBeenCalledWith('2', false);
    });

    it('shows event details when selected', () => {
        // Mock the useQuery response for event details
        (useQuery as any).mockReturnValue({
            registrations: [
                {
                    _id: 'r1',
                    attendee: {
                        name: 'John Doe',
                        phoneNumber: '1234567890',
                        placeOfResidence: 'City',
                        isFirstTimeGuest: true,
                    },
                    attendanceTime: Date.now(),
                },
            ],
        });

        render(
            <EventList
                events={mockEvents}
                selectedEvent="1"
                onSelectEvent={mockOnSelectEvent}
                onToggleStatus={mockOnToggleStatus}
            />
        );

        expect(screen.getByText('Hide Details')).toBeInTheDocument();
        expect(screen.getByText('Checked-in Attendees')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
