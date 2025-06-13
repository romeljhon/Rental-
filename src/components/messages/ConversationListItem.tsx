
import Image from 'next/image';
import type { Conversation, UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import { Package } from 'lucide-react';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string; // To determine the other participant
  onSelect: (conversationId: string) => void;
}

export function ConversationListItem({ conversation, isSelected, currentUserId, onSelect }: ConversationListItemProps) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left p-3 rounded-lg flex items-start space-x-3 transition-colors duration-150
                  ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
    >
      <div className="relative flex-shrink-0">
        <Image
          src={otherParticipant?.avatarUrl || 'https://placehold.co/40x40.png'}
          alt={otherParticipant?.name || 'User'}
          width={40}
          height={40}
          className="rounded-full object-cover"
          data-ai-hint="profile person"
        />
        {/* Add online indicator if needed */}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="font-semibold text-sm truncate text-foreground">{otherParticipant?.name || 'Unknown User'}</h3>
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNowStrict(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
            </p>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-xs text-muted-foreground truncate leading-snug">
            {conversation.lastMessage.senderId === currentUserId && "You: "}
            {conversation.lastMessage.text}
          </p>
        )}
        {conversation.itemContext && (
          <div className="mt-1 flex items-center text-xs text-muted-foreground/80">
            <Package size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate italic">Item: {conversation.itemContext.name}</span>
          </div>
        )}
      </div>
      {conversation.unreadCount && conversation.unreadCount > 0 && !isSelected && (
        <Badge variant="default" className="flex-shrink-0 bg-accent text-accent-foreground text-xs h-5 px-1.5 leading-tight ml-2 self-center">
          {conversation.unreadCount}
        </Badge>
      )}
    </button>
  );
}
