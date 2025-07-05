import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string | null;
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: LogoutConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90%] max-w-md rounded-lg p-4 sm:p-6">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl font-bold text-center">
            Are you sure you want to log out?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Log out of Chatbot as {userEmail}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col space-y-2 sm:flex-col sm:space-x-0 sm:space-y-2">
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} className="w-full">
              Log out
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
