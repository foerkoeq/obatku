# User Management Components

This directory contains all the user management components for the ObatKu Pharmacy Management System.

## Components Overview

### 1. AddUserModal (`add-user-modal.tsx`)
- **Purpose**: Modal for creating new users
- **Features**: 
  - Form validation with Zod schema
  - Backend integration with `/api/users/register`
  - Password generation from birth date
  - Loading states and error handling
  - Success callbacks for data refresh

### 2. EditUserModal (`edit-user-modal.tsx`)
- **Purpose**: Modal for editing existing user profiles
- **Features**:
  - Pre-populated form with existing data
  - Avatar upload with preview
  - File validation (max 5MB, image types only)
  - Backend integration with `/api/users/profile`
  - Real-time form updates

### 3. UserTable (`user-table.tsx`)
- **Purpose**: Main user management interface
- **Features**:
  - Server-side pagination
  - Advanced search and filtering
  - Bulk actions (delete, status update)
  - Export functionality (Excel/CSV)
  - Real-time data updates
  - Role management integration

### 4. ChangeRoleModal (`change-role-modal.tsx`)
- **Purpose**: Modal for changing user roles
- **Features**:
  - Role selection dropdown
  - Backend integration
  - Loading states
  - Success callbacks

### 5. UserActionConfirmationDialog (`user-action-confirmation-dialog.tsx`)
- **Purpose**: Reusable confirmation dialog
- **Features**:
  - Customizable title and description
  - Confirm/cancel button text
  - Generic action handling

## Usage Examples

### Basic User Table
```tsx
import { UserTable } from "@/components/users";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1>User Management</h1>
      <UserTable />
    </div>
  );
}
```

### Add User Modal
```tsx
import { AddUserModal } from "@/components/users";

const [isOpen, setIsOpen] = useState(false);

<AddUserModal 
  open={isOpen} 
  onOpenChange={setIsOpen}
  onSuccess={() => {
    // Refresh data after user creation
    fetchUsers();
  }}
/>
```

### Edit User Modal
```tsx
import { EditUserModal } from "@/components/users";

const [editUser, setEditUser] = useState<User | null>(null);

<EditUserModal
  user={editUser}
  open={!!editUser}
  onOpenChange={(open) => setEditUser(open ? editUser : null)}
  onSuccess={() => {
    // Refresh data after user update
    fetchUsers();
  }}
/>
```

## Backend Integration

All components are fully integrated with the backend API:

- **User Service**: `lib/services/user.service.ts`
- **API Endpoints**: 
  - `GET /api/users` - List users with pagination/filters
  - `POST /api/users` - Create new user
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `POST /api/users/bulk-delete` - Bulk delete users
  - `GET /api/users/export` - Export users to Excel/CSV

## State Management

Components use the following state management patterns:

- **Local State**: Component-level state for UI interactions
- **Form State**: React Hook Form for form management
- **Global State**: Jotai stores for app-wide state
- **API State**: Service layer for backend communication

## Error Handling

Comprehensive error handling implemented:

- **Validation Errors**: Field-level validation with Zod
- **API Errors**: Backend error handling with user feedback
- **Network Errors**: Connection error handling
- **User Feedback**: Toast notifications for all operations

## Loading States

Loading states implemented for:

- **Form Submission**: Submit buttons with loading indicators
- **Data Fetching**: Table loading states
- **File Uploads**: Image upload progress
- **Bulk Operations**: Bulk action loading states

## File Upload

Avatar upload system includes:

- **File Validation**: Type and size restrictions
- **Preview System**: Real-time image preview
- **Error Handling**: Upload error feedback
- **Progress Tracking**: Upload progress indicators

## Security Features

- **Input Validation**: Client-side validation with Zod
- **File Security**: File type and size validation
- **Role-based Access**: Role management system
- **Permission System**: Granular permission control

## Performance Optimizations

- **Debounced Search**: Search input with 500ms debounce
- **Pagination**: Server-side pagination for large datasets
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components

## Testing

Components are designed for easy testing:

- **Mock Data**: Ready for unit testing
- **Props Interface**: Clear component contracts
- **Error Boundaries**: Graceful error handling
- **Loading States**: Predictable loading behavior

## Future Enhancements

Planned improvements:

- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Filters**: Date range and custom filters
- **Bulk Operations**: More bulk actions (role change, status update)
- **Audit Trail**: User action logging
- **Import Functionality**: Bulk user import from Excel/CSV
