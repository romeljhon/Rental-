
"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationListItem } from '@/components/messages/ConversationListItem';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageSquare, Search } from 'lucide-react';
import type { Conversation, Message as MessageType, UserProfile, RentalItem } from '@/types';
import Image from 'next/image';
import { getActiveUserId, getActiveUserProfile, MOCK_USER_JOHN, MOCK_USER_ALICE } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';

const mockUsersForChat: UserProfile[] = [
  MOCK_USER_JOHN,
  MOCK_USER_ALICE,
  { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'user789', name: 'Charlie Chaplin', avatarUrl: 'https://placehold.co/40x40.png' },
];

const ITEM_CONTEXT_CAMERA: Pick<RentalItem, 'id' | 'name'> = { id: '1', name: 'Professional DSLR Camera' };
const ITEM_CONTEXT_BIKE: Pick<RentalItem, 'id' | 'name'> = { id: '2', name: 'Mountain Bike - Full Suspension' };
const ITEM_CONTEXT_JACKET: Pick<RentalItem, 'id' | 'name'> = { id: '3', name: 'Vintage Leather Jacket' };

const CONVERSATIONS_STORAGE_KEY = 'rentaleaseConversations';
const MESSAGES_STORAGE_KEY = 'rentaleaseMessages';

const getInitialMockConversations = (loggedInUserId: string): Conversation[] => [
  { 
    id: 'conv1', 
    participants: [MOCK_USER_JOHN, mockUsersForChat.find(u => u.id === 'user456')!], 
    lastMessage: { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: loggedInUserId === MOCK_USER_JOHN.id ? false : loggedInUserId === 'user456' ? true : false },
    unreadCount: loggedInUserId === MOCK_USER_JOHN.id ? 1 : 0,
    itemContext: ITEM_CONTEXT_CAMERA
  },
  { 
    id: 'conv2', 
    participants: [MOCK_USER_ALICE, mockUsersForChat.find(u => u.id === 'user789')!], 
    lastMessage: { id: 'msg2', conversationId: 'conv2', senderId: MOCK_USER_ALICE.id, text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
    itemContext: ITEM_CONTEXT_BIKE
  },
   { 
    id: 'conv3', 
    participants: [MOCK_USER_JOHN, MOCK_USER_ALICE], 
    lastMessage: { id: 'msg3', conversationId: 'conv3', senderId: MOCK_USER_ALICE.id, text: 'Hi John, about the jacket...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), isRead: loggedInUserId === MOCK_USER_JOHN.id ? false : loggedInUserId === MOCK_USER_ALICE.id ? true : false },
    unreadCount: loggedInUserId === MOCK_USER_JOHN.id ? 1 : 0,
    itemContext: ITEM_CONTEXT_JACKET
  },
  { 
    id: 'conv4',
    participants: [MOCK_USER_JOHN, mockUsersForChat.find(u => u.id === 'user456')!], 
    lastMessage: { id: 'msg4', conversationId: 'conv4', senderId: MOCK_USER_JOHN.id, text: 'Just a general question.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true },
  },
];

const initialMockMessages: Record<string, MessageType[]> = {
  conv1: [ 
    { id: 'msgA', conversationId: 'conv1', senderId: 'user456', text: 'Hi John!', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'msgB', conversationId: 'conv1', senderId: MOCK_USER_JOHN.id, text: 'Hey Bob! What\'s up?', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  ],
  conv2: [ 
    { id: 'msgC', conversationId: 'conv2', senderId: 'user789', text: 'Regarding the bike rental...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: 'msg2', conversationId: 'conv2', senderId: MOCK_USER_ALICE.id, text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ],
  conv3: [ 
    { id: 'msgD', conversationId: 'conv3', senderId: MOCK_USER_ALICE.id, text: 'Hi John, about the jacket...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1)},
    { id: 'msgE', conversationId: 'conv3', senderId: MOCK_USER_JOHN.id, text: 'Hey Alice, what about it?', timestamp: new Date(Date.now() - 1000 * 60 * 58)},
  ],
  conv4: [
    { id: 'msgF', conversationId: 'conv4', senderId: MOCK_USER_JOHN.id, text: 'Just a general question.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: 'msgG', conversationId: 'conv4', senderId: 'user456', text: 'Sure, what is it?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23) },
  ]
};

const parseStoredConversations = (jsonString: string | null, loggedInUserId: string): Conversation[] => {
  if (!jsonString) return getInitialMockConversations(loggedInUserId);
  try {
    const parsed = JSON.parse(jsonString) as Conversation[];
    return parsed.map(conv => ({
      ...conv,
      lastMessage: conv.lastMessage ? {
        ...conv.lastMessage,
        timestamp: new Date(conv.lastMessage.timestamp)
      } : undefined,
      // Recalculate unreadCount based on current user or keep as is if stored
      unreadCount: conv.lastMessage && conv.lastMessage.senderId !== loggedInUserId && !conv.lastMessage.isRead ? 1 : 0, 
    }));
  } catch (error) {
    console.error("Error parsing conversations from localStorage:", error);
    return getInitialMockConversations(loggedInUserId);
  }
};

const parseStoredMessages = (jsonString: string | null): Record<string, MessageType[]> => {
  if (!jsonString) return initialMockMessages;
  try {
    const parsed = JSON.parse(jsonString) as Record<string, any[]>;
    const result: Record<string, MessageType[]> = {};
    for (const convId in parsed) {
      result[convId] = parsed[convId].map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return result;
  } catch (error) {
    console.error("Error parsing messages from localStorage:", error);
    return initialMockMessages;
  }
};


function MessagesPageContent() {
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, MessageType[]>>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]); // Messages for the selected conversation
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUserId);

  // Load active user on mount
  useEffect(() => {
    const activeId = getActiveUserId();
    const activeProfile = getActiveUserProfile();
    setCurrentUserId(activeId);
    setCurrentUserProfile(activeProfile);
  }, []);

  // Load conversations and messages from localStorage or defaults
  useEffect(() => {
    if (currentUserId) {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        const storedConvsJson = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
        const loadedConversations = parseStoredConversations(storedConvsJson, currentUserId);
        
        const userConversations = loadedConversations
          .filter(conv => conv.participants.some(p => p.id === currentUserId))
          .sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0));
        setConversations(userConversations);

        const storedMsgsJson = localStorage.getItem(MESSAGES_STORAGE_KEY);
        const loadedMessages = parseStoredMessages(storedMsgsJson);
        setAllMessages(loadedMessages);
        
        const targetUserIdFromUrl = searchParams.get('with');
        const targetItemId = searchParams.get('contextItemId');
        const targetConvId = searchParams.get('convId');
        let preSelectedConvId: string | null = null;

        if (targetConvId) {
          const convExists = userConversations.find(c => c.id === targetConvId);
          if (convExists) preSelectedConvId = targetConvId;
        } else if (targetUserIdFromUrl) {
          const potentialConvs = userConversations.filter(conv => 
            conv.participants.some(p => p.id === targetUserIdFromUrl)
          );
          if (targetItemId) {
            const itemSpecificConv = potentialConvs.find(conv => conv.itemContext?.id === targetItemId);
            if (itemSpecificConv) {
              preSelectedConvId = itemSpecificConv.id;
            }
          }
          if (!preSelectedConvId && potentialConvs.length > 0) {
             preSelectedConvId = potentialConvs[0].id; 
          }
        }

        if (preSelectedConvId) {
          setSelectedConversationId(preSelectedConvId);
        } else if (userConversations.length > 0) {
          setSelectedConversationId(userConversations[0].id);
        } else {
          setSelectedConversationId(null);
        }
      }
      setIsLoading(false);
    }
  }, [currentUserId, searchParams]);

  // Update localStorage when conversations change
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0 && !isLoading) { // isLoading check to avoid overwriting on initial empty state
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, isLoading]);

  // Update localStorage when allMessages change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(allMessages).length > 0 && !isLoading) {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
    }
  }, [allMessages, isLoading]);
  
  // Set messages for selected conversation and mark as read
  useEffect(() => {
    if (selectedConversationId && Object.keys(allMessages).length > 0) {
      setMessages(allMessages[selectedConversationId] || []);
      setConversations(prev => prev.map(c => 
          c.id === selectedConversationId ? {...c, unreadCount: 0, lastMessage: c.lastMessage ? {...c.lastMessage, isRead: true} : undefined } : c
      ));
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, allMessages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !currentUserId || !currentUserProfile || !otherParticipant) return;

    setIsSending(true);
    const newMsg: MessageType = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date(),
      isRead: true, // Sender has read it
    };

    setTimeout(() => {
      // Update messages for the current view
      setMessages(prev => [...prev, newMsg]);
      
      // Update allMessages state
      setAllMessages(prevAll => {
        const updatedConvMessages = [...(prevAll[selectedConversationId] || []), newMsg];
        return { ...prevAll, [selectedConversationId]: updatedConvMessages };
      });
      
      // Update conversations state
      setConversations(prevConvs => prevConvs.map(c => 
        c.id === selectedConversationId ? {...c, lastMessage: newMsg, unreadCount: 0 } : c // Reset unread for self
      ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0))
      );
      
      addNotification({
        targetUserId: otherParticipant.id,
        eventType: 'new_message',
        title: `New message from ${currentUserProfile.name}`,
        message: newMessage.trim(),
        link: `/messages?convId=${selectedConversationId}`,
        relatedUser: {id: currentUserProfile.id, name: currentUserProfile.name},
        relatedItemId: selectedConversation?.itemContext?.id
      });
      
      setNewMessage('');
      setIsSending(false);
    }, 300); // Simulate network delay
  };

  if (isLoading || !currentUserId || !currentUserProfile) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-150px)] border bg-card rounded-xl shadow-xl overflow-hidden">
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r flex-col ${selectedConversationId && 'hidden md:flex'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold font-headline text-primary">Chats</h2>
          <div className="relative mt-2">
            <Input placeholder="Search chats..." className="pr-10" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-2 space-y-1">
            {conversations.length > 0 ? conversations.map(conv => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversationId === conv.id}
                currentUserId={currentUserId}
                onSelect={handleSelectConversation}
              />
            )) : (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>No conversations yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className={`flex-1 flex flex-col bg-background ${!selectedConversationId && 'hidden md:flex'}`}>
        {selectedConversation && otherParticipant ? (
          <>
            <div className="p-4 border-b flex items-center space-x-3 shadow-sm">
              <Image
                src={otherParticipant.avatarUrl || 'https://placehold.co/40x40.png'}
                alt={otherParticipant.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
                data-ai-hint="profile person"
              />
              <div>
                <h3 className="font-semibold text-foreground">{otherParticipant.name}</h3>
                {selectedConversation.itemContext && 
                  <p className="text-xs text-muted-foreground">Regarding: {selectedConversation.itemContext.name}</p>
                }
              </div>
            </div>
            <ScrollArea className="flex-grow p-4 space-y-4">
              {messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isSender={msg.senderId === currentUserId}
                  senderProfile={msg.senderId === currentUserId ? currentUserProfile : mockUsersForChat.find(u => u.id === msg.senderId)}
                />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-card">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow"
                  disabled={isSending}
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()} className="bg-accent hover:bg-accent/90">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-8">
            <MessageSquare className="h-20 w-20 opacity-30 mb-4" />
            <p className="text-xl">Select a conversation to start chatting.</p>
            <p className="text-sm mt-1">Or find a new item and contact the owner!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading messages...</p>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
