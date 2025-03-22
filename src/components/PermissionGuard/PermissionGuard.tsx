import { usePermissionStore } from "@/store/usePremissionStore";
import { Ban } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface PermissionGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  screen?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  screen = false,
}) => {
  const { permissions } = usePermissionStore();
  console.log(permissions);

  if (action === "view_bills") {
    const dailyBillPermission =
      permissions?.billing?.actions?.view_daily_bills ?? false;
    const AllBillPermission =
      permissions?.billing?.actions?.view_all_bills ?? false;

    if (dailyBillPermission || AllBillPermission) {
      return <>{children}</>;
    } else {
      return <PermissionDenied />;
    }
  }

  const hasPermission = permissions?.[module]?.actions?.[action] ?? false;
  console.log(hasPermission);
  if (!hasPermission) {
    return screen ? <PermissionDenied /> : null;
  }

  return <>{children}</>;
};

export default PermissionGuard;

const PermissionDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center  pr-8 ">
      <div className="flex flex-col items-center text-center  p-8 rounded-2xl max-w-sm">
        <Ban className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-red-600">Permission Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-xs">
          You don't have permission to view this page. Please contact your
          administrator.
        </p>
        <Button
          variant="destructive"
          className="mt-5 w-full text-sm py-2"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};
