
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ConversationListItem } from '@/components/messages/ConversationListItem';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageSquare, Search } from 'lucide-react';
import type { Conversation, Message as MessageType, UserProfile } from '@/types';
import Image from 'next/image';
import { getActiveUserId, getActiveUserProfile, MOCK_USER_JOHN, MOCK_USER_ALICE } from '@/lib/auth'; // Import auth functions

// Mock users array that includes our switchable users and others
const mockUsersForChat: UserProfile[] = [
  MOCK_USER_JOHN,
  MOCK_USER_ALICE,
  { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/40x40.png' }, // Corresponds to Bob in conversations
  { id: 'user789', name: 'Charlie Chaplin', avatarUrl: 'https://placehold.co/40x40.png' }, // Corresponds to Charlie
];


const getMockConversations = (loggedInUserId: string): Conversation[] => [
  { 
    id: 'conv1', // John (user1) with Bob (user456)
    participants: [MOCK_USER_JOHN, mockUsersForChat.find(u => u.id === 'user456')!], 
    lastMessage: { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: loggedInUserId === 'user1' ? true : false },
    unreadCount: loggedInUserId === 'user1' ? 0 : 1,
    itemContext: { id: 'item1', name: 'DSLR Camera' }
  },
  { 
    id: 'conv2', // Alice (user123) with Charlie (user789)
    participants: [MOCK_USER_ALICE, mockUsersForChat.find(u => u.id === 'user789')!], 
    lastMessage: { id: 'msg2', conversationId: 'conv2', senderId: 'user123', text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
    itemContext: { id: 'item2', name: 'Mountain Bike' }
  },
   { 
    id: 'conv3', // John (user1) with Alice (user123)
    participants: [MOCK_USER_JOHN, MOCK_USER_ALICE], 
    lastMessage: { id: 'msg3', conversationId: 'conv3', senderId: MOCK_USER_ALICE.id, text: 'Hi John, about the jacket...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), isRead: loggedInUserId === MOCK_USER_JOHN.id ? true : false },
    unreadCount: loggedInUserId === MOCK_USER_JOHN.id ? 0 : 1,
    itemContext: { id: 'item3', name: 'Leather Jacket' }
  },
];

const mockMessages: Record<string, MessageType[]> = {
  conv1: [ // John with Bob
    { id: 'msgA', conversationId: 'conv1', senderId: 'user456', text: 'Hi John!', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'msgB', conversationId: 'conv1', senderId: MOCK_USER_JOHN.id, text: 'Hey Bob! What\'s up?', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  ],
  conv2: [ // Alice with Charlie
    { id: 'msgC', conversationId: 'conv2', senderId: 'user789', text: 'Regarding the bike rental...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: 'msg2', conversationId: 'conv2', senderId: MOCK_USER_ALICE.id, text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ],
  conv3: [ // John with Alice
    { id: 'msgD', conversationId: 'conv3', senderId: MOCK_USER_ALICE.id, text: 'Hi John, about the jacket...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1)},
    { id: 'msgE', conversationId: 'conv3', senderId: MOCK_USER_JOHN.id, text: 'Hey Alice, what about it?', timestamp: new Date(Date.now() - 1000 * 60 * 58)},
  ]
};


export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUserId);

  useEffect(() => {
    const activeId = getActiveUserId();
    const activeProfile = getActiveUserProfile();
    setCurrentUserId(activeId);
    setCurrentUserProfile(activeProfile);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      setIsLoading(true);
      // Simulate API call to fetch conversations for the current user
      setTimeout(() => {
        const userConversations = getMockConversations(currentUserId).filter(conv => conv.participants.some(p => p.id === currentUserId));
        setConversations(userConversations);
        if (userConversations.length > 0) {
          // Try to keep selected conversation if still valid, otherwise select first
           if (selectedConversationId && userConversations.some(c => c.id === selectedConversationId)) {
            // keep current selection
          } else {
            setSelectedConversationId(userConversations[0].id);
          }
        } else {
            setSelectedConversationId(null);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [currentUserId]); // Re-fetch/filter conversations when user changes

  useEffect(() => {
    if (selectedConversationId) {
      setMessages(mockMessages[selectedConversationId] || []);
      // Mark messages as read (mock)
      setConversations(prev => prev.map(c => c.id === selectedConversationId ? {...c, unreadCount: 0} : c));
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !currentUserId) return;

    setIsSending(true);
    const newMsg: MessageType = {
      id: `msg${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, newMsg]);
      setConversations(prevConvs => prevConvs.map(c => 
        c.id === selectedConversationId ? {...c, lastMessage: newMsg} : c
      ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0))
      );
      setNewMessage('');
      setIsSending(false);
    }, 500);
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
      <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
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

      <div className="flex-1 flex flex-col bg-background">
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
