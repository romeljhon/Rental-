import type { Message as MessageType, UserProfile } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface MessageBubbleProps {
  message: MessageType;
  isSender: boolean;
  senderProfile?: UserProfile; // For displaying avatar on received messages
}

export function MessageBubble({ message, isSender, senderProfile }: MessageBubbleProps) {
  return (
    <div className={`flex items-end space-x-2 ${isSender ? 'justify-end' : ''}`}>
      {!isSender && senderProfile && (
        <Image
          src={senderProfile.avatarUrl || 'https://placehold.co/32x32.png'}
          alt={senderProfile.name}
          width={32}
          height={32}
          className="rounded-full h-8 w-8 object-cover self-end"
          data-ai-hint="profile person"
        />
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow
                    ${isSender 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-muted text-foreground rounded-bl-none'
                    }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70'}`}>
          {format(new Date(message.timestamp), 'p')}
        </p>
      </div>
       {isSender && ( // Placeholder for sender avatar if desired on the right
        <div className="w-8 h-8 flex-shrink-0"></div>
      )}
    </div>
  );
}
