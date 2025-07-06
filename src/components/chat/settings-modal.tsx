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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('General');
  const { setTheme, theme } = useTheme();

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
        return <div className="p-4">Personalization settings will go here.</div>;
      case 'Security':
        return <div className="p-4">Security settings will go here.</div>;
      case 'Account':
        return <div className="p-4">Account settings will go here.</div>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="border-b bg-secondary/20 p-4 md:w-1/3 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between mb-4">
              {/* <h2 className="text-xl font-semibold">Settings</h2> */}
              <Button className='rounded-full' variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-wrap gap-2 md:flex-col md:gap-0 md:space-y-1">
              <Button
                variant={activeTab === 'General' ? 'secondary' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('General')}
              >
                <Settings className="mr-2 h-4 w-4" />
                General
              </Button>
              <Button
                variant={activeTab === 'Personalization' ? 'secondary' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('Personalization')}
              >
                <User className="mr-2 h-4 w-4" />
                Personalization
              </Button>
              <Button
                variant={activeTab === 'Security' ? 'secondary' : 'ghost'}
                className="justify-start md:w-full"
                onClick={() => setActiveTab('Security')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
              <Button
                variant={activeTab === 'Account' ? 'secondary' : 'ghost'}
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
    </Dialog>
  );
}