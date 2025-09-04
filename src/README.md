# Rixdu Project Architecture

This document outlines the architecture and folder structure of the Rixdu application.

## Folder Structure

```
src/
├── assets/                # Static assets like images, fonts, etc.
├── components/            # Reusable UI components
│   ├── common/            # Basic UI components (Button, Input, Card, etc.)
│   ├── layout/            # Layout components (SharedLayout, AuthLayout, etc.)
│   └── modules/           # More complex reusable components
├── features/              # Feature-based modules
│   ├── auth/              # Authentication related code
│   ├── property/          # Property feature code
│   ├── motors/            # Motors feature code
│   ├── jobs/              # Jobs feature code
│   ├── profile/           # User profile related code
│   └── ...                # Other features
├── hooks/                 # Custom React hooks
├── pages/                 # Page components, organized by feature
│   ├── home/              # Home page components
│   ├── auth/              # Auth pages (login, register)
│   ├── property/          # Property pages
│   └── ...                # Other page directories
├── routes/                # Routing configuration
├── App.jsx                # Main App component
├── App.css                # Global styles
├── index.css              # Root CSS file
└── main.jsx               # Application entry point
```

## Architecture Overview

The application follows a feature-based architecture with the following principles:

1. **Feature-Based Organization**: Code is organized by features (property, motors, jobs, etc.) rather than by technical concerns (components, services, etc.).

2. **Component Hierarchy**:

   - `components/common/`: Reusable UI components like buttons, inputs, cards
   - `components/layout/`: Layout components that define the structure of pages
   - `components/modules/`: More complex reusable components that may use multiple common components

3. **Routing Structure**:

   - Main routes are defined in `routes/AppRoutes.jsx`
   - Uses nested routes with dedicated layouts for different sections:
     - SharedLayout: For the main public sections
     - AuthLayout: For authentication screens
     - DashboardLayout: For user profile and dashboard sections

4. **State Management**:
   - Each feature may have its own state management solution
   - Hooks are used for shared state and logic

## Styling

The application uses Tailwind CSS for styling, with custom utility classes when needed.

## Best Practices

1. **Imports**: Use absolute imports for better readability
2. **Component Organization**: Each component should be in its own file with a clear, concise name
3. **Exports**: Use named exports for better code splitting and imports
4. **File Naming**: Use PascalCase for component files and camelCase for utility files
5. **Feature Organization**: Keep related code together within a feature directory
