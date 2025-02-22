import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";

export const Profile = ({ currentUser }) => (
  <Card>
    <CardHeader>
      <CardTitle>Profile Settings</CardTitle>
      <CardDescription>
        Manage your account settings and preferences.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="text-xl font-semibold">{currentUser?.username}</h3>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={currentUser?.email}
            readOnly
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-username">Username</Label>
          <Input id="profile-username" value={currentUser?.username} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-role">Role</Label>
          <Input
            id="profile-role"
            value={currentUser?.role}
            disabled
            readOnly
          />
        </div>
      </div>

      <div className="pt-4">
        <Button className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </CardContent>
  </Card>
);
