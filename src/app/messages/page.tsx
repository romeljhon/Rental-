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

const currentUserId = 'user123'; // Assume this is the ID of the logged-in user
const currentUserProfile: UserProfile = { id: currentUserId, name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/40x40.png' };

const mockUsers: UserProfile[] = [
  currentUserProfile,
  { id: 'user456', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 'user789', name: 'Charlie Chaplin', avatarUrl: 'https://placehold.co/40x40.png' },
];

const mockConversations: Conversation[] = [
  { 
    id: 'conv1', 
    participants: [mockUsers[0], mockUsers[1]], 
    lastMessage: { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false },
    unreadCount: 1,
    itemContext: { id: 'item1', name: 'DSLR Camera' }
  },
  { 
    id: 'conv2', 
    participants: [mockUsers[0], mockUsers[2]], 
    lastMessage: { id: 'msg2', conversationId: 'conv2', senderId: 'user123', text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
    itemContext: { id: 'item2', name: 'Mountain Bike' }
  },
];

const mockMessages: Record<string, MessageType[]> = {
  conv1: [
    { id: 'msgA', conversationId: 'conv1', senderId: 'user456', text: 'Hi Alice!', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    { id: 'msgB', conversationId: 'conv1', senderId: 'user123', text: 'Hey Bob! What\'s up?', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    { id: 'msg1', conversationId: 'conv1', senderId: 'user456', text: 'Hey, is the camera still available for next weekend?', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  ],
  conv2: [
    { id: 'msgC', conversationId: 'conv2', senderId: 'user789', text: 'Regarding the bike rental...', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { id: 'msg2', conversationId: 'conv2', senderId: 'user123', text: 'Sure, I can drop it off on Friday evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ],
};


export default function MessagesPage() {
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
    // Simulate API call
    setTimeout(() => {
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversationId(mockConversations[0].id);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

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
    if (!newMessage.trim() || !selectedConversationId) return;

    setIsSending(true);
    const newMsg: MessageType = {
      id: `msg${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    // Simulate sending message
    setTimeout(() => {
      setMessages(prev => [...prev, newMsg]);
      // Update last message in conversation list (mock)
      setConversations(prevConvs => prevConvs.map(c => 
        c.id === selectedConversationId ? {...c, lastMessage: newMsg} : c
      ).sort((a,b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0)) // re-sort
      );
      setNewMessage('');
      setIsSending(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-150px)] border bg-card rounded-xl shadow-xl overflow-hidden">
      {/* Conversations List */}
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

      {/* Message View */}
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
                  senderProfile={msg.senderId === currentUserId ? currentUserProfile : otherParticipant}
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
