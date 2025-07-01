import { users } from "@/lib/data/user-demo";
import { UserTable } from "@/components/users/user-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SiteBreadcrumb from "@/components/site-breadcrumb";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <SiteBreadcrumb />
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable data={users} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage; 