import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, MoreVertical, Edit, Trash } from "lucide-react";
import { createUser, deleteUser, updateUser } from "@/services/auth";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const roles = ["admin", "manager", "cashier", "user"] as const;

const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(roles, { message: "Please select a valid role" }),
});

export const UserList = () => {
  const { fetchUsers, users } = useUserStore();
  const [editUser, setEditUser] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  useEffect(() => {
    fetchUsers();
  }, []);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      role: "admin",
    },
  });

  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: {
    email: string;
    username: string;
    password: string;
    role: string;
  }) => {
    try {
      if (editUser) {
        const result = await updateUser(editUserId, data);
        if (result.success) {
          toast({
            title: "User updated successfully",
            description: "The user account has been updated.",
            className: "bg-green-500 text-white border-green-500",
          });
          fetchUsers();
          setOpen(false);
          form.reset();
        } else {
          toast({
            title: "Error updating user",
            description: result.message,
            className: "bg-red-500 text-white border-red-500",
          });
        }
      } else {
        const result = await createUser(data);
        if (result.success) {
          toast({
            title: "User added successfully",
            description: "The new user has been added to the system.",
            className: "bg-green-500 text-white border-green-500",
          });
          fetchUsers();
          setOpen(false);
          form.reset();
        } else {
          toast({
            title: "Error adding user",
            description: result.message,
            className: "bg-red-500 text-white border-red-500",
          });
        }
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };
  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({
          title: "User deleted successfully",
          description: "The user has been deleted from the system.",
          className: "bg-green-500 text-white border-green-500",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error deleting user",
          description: result.message,
          className: "bg-red-500 text-white border-red-500",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(true);
    setEditUserId(user.id);
    const { email, username, role } = user;
    form.setValue("email", email);
    form.setValue("username", username);
    form.setValue("role", role);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Users</CardTitle>
        <Dialog
          open={open}
          onOpenChange={(open) => {
            setEditUser(false);
            form.reset();
            setOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {editUser ? "Edit User" : "Add User"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                Create a new user account with specific role permissions.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <Input placeholder="Enter username" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                }

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {editUser ? "Edit User" : "Add User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{user.username}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
