import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const Settings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Application Settings</CardTitle>
      <CardDescription>
        Configure your application preferences and settings.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-gray-500">
              Receive email notifications for important updates
            </p>
          </div>
          <Button variant="outline">Configure</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Security Settings</h3>
            <p className="text-sm text-gray-500">
              Manage your security preferences
            </p>
          </div>
          <Button variant="outline">Configure</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Data Privacy</h3>
            <p className="text-sm text-gray-500">
              Control your data sharing preferences
            </p>
          </div>
          <Button variant="outline">Configure</Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
