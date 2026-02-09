/**
 * Messages Service
 * Handles conversation and messaging operations
 */

import { apiClient } from '@/lib/api-client';

interface Conversation {
    id: number;
    participant_ids: string[];
    item_context?: number;
    created_at: string;
    updated_at: string;
    messages?: Message[];
    last_message?: Message;
    unreadCount?: number; // Optional unread count for the current user
}

interface Message {
    id: number;
    conversation: number;
    sender_id: string;
    text: string;
    timestamp: string;
    is_read: boolean;
}

interface CreateConversationData {
    participant_ids: string[];
    item_context?: number;
}

interface SendMessageData {
    conversation: number;
    sender_id: string;
    text: string;
}

export const messagesService = {
    /**
     * Get conversations for a user
     */
    async getConversations(userId: string): Promise<Conversation[]> {
        return apiClient.get<Conversation[]>('/conversations/', { user_id: userId });
    },

    /**
     * Get single conversation
     */
    async getConversation(id: number): Promise<Conversation> {
        return apiClient.get<Conversation>(`/conversations/${id}/`);
    },

    /**
     * Create new conversation
     */
    async createConversation(data: CreateConversationData): Promise<Conversation> {
        return apiClient.post<Conversation>('/conversations/', data);
    },

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: number): Promise<Message[]> {
        return apiClient.get<Message[]>('/messages/', { conversation_id: conversationId });
    },

    /**
     * Send a message
     */
    async sendMessage(data: SendMessageData): Promise<Message> {
        return apiClient.post<Message>('/messages/', data);
    },

    /**
     * Mark message as read
     */
    async markAsRead(messageId: number): Promise<Message> {
        return apiClient.patch<Message>(`/messages/${messageId}/`, { is_read: true });
    },

    /**
     * Get unread message count for user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const conversations = await this.getConversations(userId);
        let unreadCount = 0;

        for (const conv of conversations) {
            const messages = await this.getMessages(conv.id);
            unreadCount += messages.filter(m => !m.is_read && m.sender_id !== userId).length;
        }

        return unreadCount;
    },

    /**
     * Find or create conversation between users
     */
    async findOrCreateConversation(
        userId1: string,
        userId2: string,
        itemId?: number
    ): Promise<Conversation> {
        const conversations = await this.getConversations(userId1);

        // Try to find existing conversation
        const existing = conversations.find(conv =>
            conv.participant_ids.includes(userId1) &&
            conv.participant_ids.includes(userId2) &&
            (!itemId || conv.item_context === itemId)
        );

        if (existing) {
            return existing;
        }

        // Create new conversation
        return this.createConversation({
            participant_ids: [userId1, userId2],
            item_context: itemId,
        });
    },
};

export type { Conversation, Message };
