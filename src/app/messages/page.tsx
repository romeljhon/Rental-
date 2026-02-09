/**
 * Messages Page
 * Real-time messaging between users
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, User, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { messagesService, type Conversation, type Message } from '@/services';
import { authService } from '@/services';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const convs = await messagesService.getConversations(currentUser.id);
      setConversations(convs);

      // Auto-select first conversation
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const msgs = await messagesService.getMessages(conversationId);
      setMessages(msgs);

      // Mark messages as read
      const unreadMessages = msgs.filter(
        m => !m.is_read && m.sender_id !== currentUser?.id
      );
      for (const msg of unreadMessages) {
        await messagesService.markAsRead(msg.id);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const newMessage = await messagesService.sendMessage({
        conversation: selectedConversation.id,
        sender_id: currentUser.id,
        text: messageText.trim(),
      });

      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    // In a real app, you'd fetch participant details
    const otherUserId = conv.participant_ids.find(id => id !== currentUser?.id);
    return {
      id: otherUserId || '',
      name: `User ${otherUserId}`,
      avatarUrl: 'https://placehold.co/40x40.png',
    };
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black font-headline text-foreground tracking-tight">
              Messages
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Chat with renters and owners
            </p>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
          {/* Conversations List */}
          <div className={cn(
            "bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-primary/10 overflow-hidden flex flex-col",
            selectedConversation && "hidden lg:flex"
          )}>
            <div className="p-6 border-b border-primary/10">
              <h2 className="text-lg font-black uppercase tracking-widest mb-4">Conversations</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10 h-10 rounded-xl"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map((conv) => {
                    const otherUser = getOtherParticipant(conv);
                    const isSelected = selectedConversation?.id === conv.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full p-4 rounded-2xl mb-2 transition-all text-left",
                          isSelected
                            ? "bg-primary/10 border-2 border-primary/20"
                            : "hover:bg-muted/50 border-2 border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser.avatarUrl} />
                            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{otherUser.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message?.text || 'No messages yet'}
                            </p>
                          </div>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-white">{conv.unreadCount}</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages View */}
          <div className={cn(
            "lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-primary/10 overflow-hidden flex flex-col",
            !selectedConversation && "hidden lg:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-primary/10 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getOtherParticipant(selectedConversation).avatarUrl} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedConversation).name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{getOtherParticipant(selectedConversation).name}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMine = message.sender_id === currentUser?.id;

                      return (
                        <div
                          key={message.id}
                          className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[70%] rounded-2xl p-4",
                            isMine
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          )}>
                            <p className="text-sm">{message.text}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              isMine ? "text-white/60" : "text-muted-foreground"
                            )}>
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-6 border-t border-primary/10">
                  <div className="flex gap-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-12 rounded-2xl"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!messageText.trim() || isSending}
                      className="rounded-2xl px-6 font-bold uppercase tracking-widest shadow-lg"
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center">
                <div>
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                  <h3 className="text-lg font-bold mb-2">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
