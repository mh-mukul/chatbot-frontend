import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { X } from 'lucide-react'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (currentPassword: string, newPassword: string) => void
}

export function PasswordResetModal({
  isOpen,
  onClose,
  onConfirm,
}: PasswordResetModalProps) {
  const isMobile = useIsMobile()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setCurrentPasswordError('');
    setNewPasswordError('');
  };

  // Clear state when the modal is closed
  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = () => {
    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required.');
      hasError = true;
    } else if (currentPassword.length < 6) {
      setCurrentPasswordError('Password must be at least 6 characters long.');
      hasError = true;
    } else {
      setCurrentPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('New password is required.');
      hasError = true;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters long.');
      hasError = true;
    } else {
      setNewPasswordError('');
    }

    if (hasError) return;

    onConfirm(currentPassword, newPassword);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] h-auto rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          {isMobile && (
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          )}
        </DialogHeader>
        <div className="grid gap-4 pt-2 sm:pt-4 pb-4">
          <div className="grid sm:grid-cols-4 items-start sm:items-center gap-4">
            <Label
              htmlFor="current-password"
              className="sm:text-right mt-1"
            >
              Current Password
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError('');
                }}
                className={currentPasswordError ? "border-red-500" : ""}
              />
              {currentPasswordError && (
                <p className="text-xs text-red-500">{currentPasswordError}</p>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-4 items-start sm:items-center gap-4">
            <Label htmlFor="new-password" className="sm:text-right mt-1">
              New Password
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError('');
                }}
                className={newPasswordError ? "border-red-500" : ""}
              />
              {newPasswordError && (
                <p className="text-xs text-red-500">{newPasswordError}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleConfirm}>
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}