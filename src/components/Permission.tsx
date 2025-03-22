import React, { useEffect, useState } from "react";
import {
  addRolePermissions,
  getPermissions,
  getRolePermissions,
} from "@/services/permission";
import { FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Shield, ShieldCheck } from "lucide-react";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";

type Action = {
  id: number;
  name: string;
};

type PermissionsData = {
  permissions: string[];
  actions: {
    [key: string]: Action[];
  };
};

const roles = ["admin", "cashier"] as const;

const permissionSchema = z.object({
  role: z.enum(roles),
  permissions: z.record(
    z.string(),
    z.object({
      actions: z.record(z.string(), z.boolean()),
    })
  ),
});

const Permission = () => {
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState(null);
  const [
    isLoadingSelectedRolePermissions,
    setIsLoadingSelectedRolePermissions,
  ] = useState(false);
  const { toast } = useToast();
  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      permissions: {},
      role: roles[0],
    },
  });

  useEffect(() => {
    const loadPermissions = async () => {
      const response = await getPermissions();
      setPermissions(response);
    };

    loadPermissions();
  }, []);

  useEffect(() => {
    setIsLoadingSelectedRolePermissions(true);
    const getSelectedRolePermissions = async () => {
      try {
        const rolePermissions = await getRolePermissions(
          methods.getValues("role")
        );
        setSelectedRolePermissions(rolePermissions);
        setIsLoadingSelectedRolePermissions(false);
      } catch (error) {
        setIsLoadingSelectedRolePermissions(false);
        toast({
          title: "Error",
          description: "Something went wrong",
          className: "bg-red-500 text-white",
        });
      }
    };
    getSelectedRolePermissions();
  }, [methods.getValues("role")]);

  const { control, watch, handleSubmit, formState, reset } = methods;

  useEffect(() => {
    if (selectedRolePermissions) {
      if (!selectedRolePermissions.permissions) {
        
        methods.setValue("permissions", {});
        return;
      }

      const permissions = selectedRolePermissions.permissions || {};

      methods.setValue(
        "permissions",
        Object.keys(permissions).reduce((acc: any, permissionKey: string) => {
          const permission = permissions[permissionKey];
          acc[permissionKey] = {
            actions: permission.actions,
          };
          return acc;
        }, {})
      );

      methods.setValue("role", selectedRolePermissions.role);
    }
  }, [selectedRolePermissions]);

  const onSubmit = async (data: any) => {
    try {
      const result = await addRolePermissions(data);

      if (result) {
        toast({
          title: "Success",
          description: "Role permissions added successfully",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong",
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        className: "bg-red-500 text-white ",
      });
    }
  };

  const renderActionToggle = (action: Action, category: string) => {
    return (
      <FormItem
        key={action.id}
        className="flex items-center justify-between space-y-0 py-3"
      >
        <FormLabel className="flex-grow font-medium">
          {action.name
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </FormLabel>
        <Controller
          control={control}
          name={`permissions.${category}.actions.${action.name}`}
          defaultValue={false}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label={`Toggle ${action.name} permission`}
            />
          )}
        />
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <div>
      {permissions && isLoadingSelectedRolePermissions && (
        <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      <FormProvider {...methods}>
        <>
          {Object.keys(formState.errors).length > 0 && (
            <div className="text-red-500">
              {Object.entries(formState.errors).map(([key, value]) => (
                <div key={key}>{`${key}: ${
                  value.message || "Invalid value"
                }`}</div>
              ))}
            </div>
          )}
        </>
        <Card className="sm:max-w-[100vw] max-w-[90%] overflow-hidden">
          <CardHeader className="p-5">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Role Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={control}
                name="role"
                render={({ field }) => (
                  <FormItem className="px-3">
                    <FormLabel>Select Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center">
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ScrollArea className=" ">
                {permissions ? (
                  <div className=" grid lg:grid-cols-4 gap-6 sm:grid-cols-2 grid-cols-1">
                    {permissions.permissions.map((category) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {category
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </CardTitle>
                            <Badge variant="secondary">
                              {permissions.actions[category].length} Actions
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {permissions.actions[category].map((action) => (
                              <React.Fragment key={action.id}>
                                {renderActionToggle(action, category)}
                                <Separator />
                              </React.Fragment>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Shield className="h-8 w-8 text-muted-foreground animate-pulse" />
                      <p className="text-muted-foreground">
                        Loading permissions...
                      </p>
                    </div>
                  </Card>
                )}
              </ScrollArea>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full sm:w-auto">
                  {formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Save Permissions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
};

export default Permission;
