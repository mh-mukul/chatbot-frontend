'use client';
import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquare, FileText, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const yesterdayChats = [
    { title: 'Fetch objects by location' },
    { title: 'Create HTML forms' },
    { title: 'Bulk notifications using topics' },
  ];

  const previous7DaysChats = [{ title: 'Backend Frontend Estimation Review' }];

  const previous30DaysChats = [
    { title: 'Alembic Multi-DB Migration' },
    { title: 'Cyberpunk Telegram Bot Logo' },
  ];

  const searchResults = [
    {
      title: 'Alembic Multi-DB Migration',
      subtitle: 'Alembic Multi-DB Migration',
      icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />,
    },
    {
      title: 'Jenkins Bitbucket Integration',
      subtitle:
        '...* -> Run Alembic migrations (`alembic upgrade head`) 3. **Build the Project** -> Build the Docker imag...',
      icon: <FileText className="w-5 h-5 text-muted-foreground" />,
    },
    {
      title: 'FastAPI migrations tools',
      subtitle:
        '...in your Alembic setup, you can modify the `env.py` file to dynamically construct the database URL using ...',
      icon: <FileText className="w-5 h-5 text-muted-foreground" />,
    },
    {
      title: 'Circular Dependency Fix',
      subtitle:
        '...ring in Alembic occurs because of **cyclic dependencies** in the foreign key relationships between the...',
      icon: <FileText className="w-5 h-5 text-muted-foreground" />,
    },
  ];

  const renderChatList = (title: string, chats: { title: string }[]) => (
    <div className="mb-4">
      <h3 className="text-xs text-muted-foreground mb-2 px-4">{title}</h3>
      <ul>
        {chats.map((chat, index) => (
          <li
            key={index}
            className="flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{chat.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] h-auto rounded-lg sm:max-w-[700px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="p-2">
          <div className="flex items-center justify-between mb-4">
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <DialogClose className="rounded-full p-2 hover:bg-accent group">
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-focus:text-foreground transition-colors" />
            </DialogClose>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery ? (
              <div>
                <ul>
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="flex items-start p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      <div className="mr-3 mt-1">{result.icon}</div>
                      <div>
                        <p className="font-semibold">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                {renderChatList('Yesterday', yesterdayChats)}
                {renderChatList('Previous 7 Days', previous7DaysChats)}
                {renderChatList('Previous 30 Days', previous30DaysChats)}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;