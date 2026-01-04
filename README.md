# Freelance PM

A comprehensive project management application for freelancers to manage clients, projects, tasks, and time tracking.

## Features

- **Client Management**: Track and manage your freelance clients
- **Project Management**: Organize projects by client with deadlines and status tracking
- **Task Management**: Kanban-style task board with priorities and due dates
- **Time Tracking**: Log billable and non-billable hours with detailed worklog
- **User Management**: Admin-only user invitations with role-based access control
- **Row-Level Security**: Users only see clients and projects assigned to them

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- TypeScript
- Joi validation
- Nodemailer for emails

### Frontend
- Next.js 15 with App Router
- React 18
- Tailwind CSS
- React Hook Form
- Zustand for state management
- Lucide React icons

## Project Structure

```
FreelanceApp/
├── backend/          # Node.js/Express API server
└── frontend/         # Next.js web application
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and email settings.

4. Run database migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Default Admin

Email: `admin@example.com`
Password: `Admin123!`

**Important**: Change the default admin password after first login.

## Database Schema

- **users**: User accounts with roles (admin/user)
- **clients**: Client information
- **projects**: Project details linked to clients
- **tasks**: Task management with priorities and statuses
- **time_entries**: Time tracking records
- **user_clients**: Junction table for user-client assignments
- **project_clients**: Junction table for project-client assignments

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Row-level security for clients and projects
- Invite-only user registration
- Protected API routes

## License

MIT
