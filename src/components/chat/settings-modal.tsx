import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Settings,
  User,
  Shield,
  Key,
  X,
  Play,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { PasswordResetModal } from './password-reset-modal';
import { passwordReset } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { redirectToLogin } from '@/lib/auth-utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('General');
  const { setTheme, theme } = useTheme();
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (currentPassword: string, newPassword: string) => {
    const { success, message } = await passwordReset(currentPassword, newPassword);
    if (success) {
      toast({
        title: 'Success',
        description: message,
      });
      setIsPasswordResetModalOpen(false);
      redirectToLogin();
    } else {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="p-4 space-y-4">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue={theme} onValueChange={(value) => setTheme(value)}>
                <SelectTrigger id="theme" className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="auto-detect">
                <SelectTrigger id="language" className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-detect">Auto-detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice">Voice</Label>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Play className="h-4 w-4" />
                </Button>
                <Select defaultValue="sol">
                  <SelectTrigger id="voice" className="w-[120px]">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sol">Sol</SelectItem>
                    <SelectItem value="luna">Luna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="follow-up-suggestions">Show follow up suggestions in chats</Label>
              <Switch id="follow-up-suggestions" defaultChecked />
            </div>
          </div>
        );
      case 'Personalization':
        return (
          <div className="p-4 space-y-4">
            <DialogHeader>
              <DialogTitle>Personalization</DialogTitle>
            </DialogHeader>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="personalized-recommendations">Personalized Recommendations</Label>
              <Switch id="personalized-recommendations" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sharing">Share data for better recommendations</Label>
              <Switch id="data-sharing" defaultChecked />
            </div>
          </div>
        );
      case 'Security':
        return (
          <div className="p-4 space-y-4">
            <DialogHeader>
              <DialogTitle>Security</DialogTitle>
            </DialogHeader>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor-auth">Enable Two-Factor Authentication</Label>
              <Switch id="two-factor-auth" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-alerts">Login Alerts</Label>
              <Switch id="login-alerts" defaultChecked />
            </div>
          </div>
        );
      case 'Account':
        return (
          <div className="p-4 space-y-4">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
            </DialogHeader>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="reset-password">Reset Password</Label>
              <Button
              variant="outline"
              onClick={() => setIsPasswordResetModalOpen(true)}
              >
              Reset
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delete-account">Delete Account</Label>
              <Button
              variant="destructive"
              onClick={() => {
                // Handle account deletion logic here
                toast({
                title: 'Account Deletion',
                description: 'This feature is not implemented yet.',
                variant: 'destructive',
                });
              }}
              >
              Delete
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="logout">Logout</Label>
              <Button
              variant="secondary"
              onClick={() => {
                // Handle logout logic here
                redirectToLogin();
              }}
              >
              Logout
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] h-auto rounded-lg sm:max-w-[700px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <div className="flex flex-col md:flex-row h-full">
          <div className="bg-secondary p-4 md:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <Button className='rounded-full' variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-wrap gap-2 md:flex-col md:gap-0 md:space-y-1">
              <Button
                variant={activeTab === 'General' ? 'default' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('General')}
              >
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
              <Button
                variant={activeTab === 'Personalization' ? 'default' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('Personalization')}
              >
                <User className="mr-2 h-4 w-4" />
                Personalization
              </Button>
              <Button
                variant={activeTab === 'Security' ? 'default' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('Security')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
              <Button
                variant={activeTab === 'Account' ? 'default' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('Account')}
              >
                <Key className="mr-2 h-4 w-4" />
                Account
              </Button>
            </nav>
          </div>
          <div className="md:w-2/3">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
        onConfirm={handlePasswordReset}
      />
    </Dialog>
  );
}