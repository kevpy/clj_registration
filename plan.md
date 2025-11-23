# Project Improvement Plan

This document outlines potential improvements for the user registration and analytics application.

## 1. Add a Testing Framework

-   [ ] **Frontend (Vite + React):**
    -   [ ] Install and configure [Vitest](https://vitest.dev/) for unit and component testing.
    -   [ ] Write unit tests for critical utility functions in `src/lib/utils.ts`.
    -   [ ] Write component tests for key components like `UserRegistration.tsx` and `EventRegistration.tsx` to verify form logic and user interactions.
    - [ ] Implement end-to-end tests for critical user flows using Playwright or Cypress
    - [ ] Add specific component tests for complex components: `EventRegistration.tsx`, `ExcelUpload.tsx`, and `EventManagement.tsx`.
-   [ ] **Backend (Convex):**
    -   [ ] Utilize Convex's built-in testing features.
    -   [ ] Write unit tests for backend functions in `convex/`, especially for mutations like `registrations.ts` and `events.ts`.
    -   [ ] Write tests to validate access control and security rules.
    -   [ ] Create comprehensive test suites for analytics functions

## 2. Enhance Form Validation and User Feedback

-   [ ] **Client-Side Validation:**
    -   [ ] Implement more specific validation rules for forms (e.g., email regex, phone number format, valid dates).
    -   [ ] Use a library like `zod` for schema-based validation that can be shared between frontend and backend.
    -   [ ] Create centralized validation utilities for consistent validation across the application
-   [ ] **Server-Side Validation:**
    -   [ ] Add comprehensive validation at the beginning of each Convex mutation to ensure data integrity.
    -   [ ] Return clear error messages from the backend to the client on validation failure.
    -   [ ] Implement validation utilities to reduce duplicated validation logic
-   [ ] **User Feedback:**
    -   [ ] Display specific error messages next to the relevant form fields.
    -   [ ] Use the `sonner` toast component to show success or failure notifications for operations like saving or deleting data.
    -   [ ] Implement form-specific loading states and validation indicators

## 3. Improve State Management

-   [ ] **Centralized State:**
    -   [ ] Implement Zustand for centralized state management to reduce prop-drilling
    -   [ ] Create dedicated stores for user session data, UI states, and frequently accessed entities
    - [ ] Migrate from component-level state to global store where appropriate
- [ ] **Routing:**
    - [ ] Replace `activeTab` state in `App.tsx` with `react-router-dom` or `TanStack Router` to handle navigation.
    - [ ] Enable deep linking to specific views (e.g., `/events`, `/register`).
-   [ ] **Data Fetching Hooks:**
    -   [ ] Create custom hooks to encapsulate Convex queries (e.g., `useEvents()`, `useAttendees(eventId)`).
    -   [ ] These hooks will handle loading, error, and data states, simplifying the components that use them.
    -   [ ] Implement caching strategies in custom hooks to optimize data fetching
-   [ ] **Large Component State Management:**
    -   [ ] Break down state in large components like `App.tsx` and `EventRegistration.tsx` into smaller, focused pieces
    -   [ ] Create dedicated hooks for complex form management

## 4. Refine the User Experience (UX)

-   [ ] **Loading and Empty States:**
    -   [ ] Add loading spinners or skeletons to components that fetch data.
    -   [ ] Implement "empty state" views for lists (e.g., events, attendees) when no data is available.
    -   [ ] Create consistent loading indicators across all components
-   [ ] **Optimistic Updates:**
    -   [ ] Implement optimistic updates for common actions like adding a new registration or event. This will make the UI feel more responsive.
-   [ ] **Confirmation Dialogs:**
    -   [ ] Add modal dialogs to confirm destructive actions like deleting an event or an attendee.
-   [ ] **Performance Optimization:**
    -   [ ] Implement pagination for large datasets in analytics and attendee lists
    -   [ ] Optimize database queries with proper indexing strategies
    -   [ ] Add virtual scrolling for large lists where applicable

## 5. Strengthen Security and Access Control

-  - [ ] **Role-Based Access Control (RBAC):**
    - [ ] Create a `users` table in `convex/schema.ts` linked to auth identities, with a `role` field (e.g., `admin`, `volunteer`).
    - [ ] Migrate existing user data to the new table structure.
    -   [ ] In Convex mutations and queries, check the user's role before performing privileged actions.
    -   [ ] Implement role-based UI controls to hide/show features based on user permissions
-   [ ] **Input Sanitization:**
    -   [ ] Review how user-provided data is rendered in the frontend to prevent XSS attacks. Although React helps, it's good practice to be aware of potential risks, especially when using `dangerouslySetInnerHTML`.
-   [ ] **Backend Security:**
    -   [ ] Add comprehensive access control checks to all Convex functions
    -   [ ] Implement audit logging for sensitive operations
    -   [ ] Add rate limiting for API endpoints where appropriate

# Implementation Plan - Refactoring & Improvements

## 1. Testing Framework Setup (High Priority)
- [x] Install Vitest and React Testing Library.
- [x] Configure test environment (jsdom).
- [x] Add unit tests for utility functions.
- [x] Add component tests for complex components (EventRegistration, ExcelUpload).
- [ ] Add end-to-end tests for critical flows (optional for now).

## 2. Component Refactoring
- [x] **EventRegistration.tsx**: Break down into smaller components:
    - `EventSelector`
    - `AttendeeSearch`
    - `RegistrationForm`
    - `RecentAttendeesList`
- [x] **ExcelUpload.tsx**: Extract components:
    - `FileUploader`
    - `DataPreview`
    - `ColumnMapper` (if complex)
- [x] **EventManagement.tsx**: Separate event creation and list views.

## 3. Backend Refactoring
- [x] **convex/registrations.ts**:
    - Break down `registerAttendeeAtDoor` into helper functions.
    - Extract validation logic.
    - Extract attendee creation/update logic.

## 4. Security & RBAC
- [x] Add `role` field to `users` table in schema.
- [x] Implement `checkRole` helper function.
- [x] Protect sensitive mutations (createEvent, updateEvent) with role checks.

## 5. Routing & Layout
- [x] Implement `react-router-dom`.
- [x] Create `DashboardLayout` with persistent navigation.
- [x] Update `App.tsx` to use routes.

## 6. UI/UX Improvements
- [ ] Add loading skeletons for data fetching.
- [ ] Improve error handling and toast messages.
- [ ] Add confirmation dialogs for destructive actions.

## 7. Documentation
- [ ] Add JSDoc to complex functions.
- [ ] Update README with setup instructions and architecture overview.
-   [ ] **Convex Function Optimization:**
    - [ ] Optimize database queries with proper indexing strategies
    - [ ] Refactor `registerAttendeeAtDoor` in `convex/registrations.ts` (currently 120+ lines) into smaller helper functions.
    - [ ] Add batch operations for bulk data processing (e.g., Excel upload)
    -   [ ] Implement proper error handling with contextual error messages in all Convex functions

## 8. Performance and Caching

-   [ ] **Data Caching:**
    -   [ ] Implement proper caching strategies for frequently accessed data
    -   [ ] Use Convex's built-in caching mechanisms where appropriate
    -   [ ] Add client-side caching for read-only data
-   [ ] **Analytics Performance:**
    -   [ ] Optimize analytics queries for better performance with large datasets
    -   [ ] Implement pagination or aggregation techniques for analytics data
    -   [ ] Add pre-aggregated data tables where appropriate for complex analytics

## 9. Documentation and Developer Experience

-   [ ] **Code Documentation:**
    -   [ ] Add JSDoc comments to all exported functions and components
    -   [ ] Create component usage documentation
    -   [ ] Document API endpoints and data flow
-   [ ] **Developer Onboarding:**
    -   [ ] Add comprehensive README files with setup instructions
    -   [ ] Create a developer onboarding guide with common tasks and workflows
    -   [ ] Document the data model and relationships
-   [ ] **Project Setup:**
    -   [ ] Add proper linting and formatting configurations (ESLint, Prettier)
    -   [ ] Implement commit hooks for code quality
    -   [ ] Add environment configuration management