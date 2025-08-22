import { Metadata } from "next";
import { UserTable } from "@/components/users";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage system users, roles, and permissions",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage system users, roles, and permissions. Add new users, update profiles, and control access levels.
        </p>
      </div>
      
      <UserTable />
    </div>
  );
} 