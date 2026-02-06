import type { Conversation, Message, UserProfile } from '@/types';
import { fetchApi, clearApiCache } from './api';

function mapBackendConversation(conv: any, loggedInUserId: string): Conversation {
    const lastMsg = conv.messages && conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1]
        : null;

    return {
        id: conv.id.toString(),
        participants: conv.participants_details || conv.participant_ids.map((id: string) => ({
            id,
            name: `User ${id}`,
            avatarUrl: 'https://placehold.co/40x40.png'
        })),
        lastMessage: lastMsg ? {
            id: lastMsg.id.toString(),
            conversationId: lastMsg.conversation.toString(),
            senderId: lastMsg.sender_id,
            text: lastMsg.text,
            timestamp: new Date(lastMsg.timestamp),
            isRead: lastMsg.is_read
        } : undefined,
        unreadCount: conv.messages ? conv.messages.filter((m: any) => m.sender_id !== loggedInUserId && !m.is_read).length : 0,
        itemContext: conv.item_details ? {
            id: conv.item_details.id.toString(),
            name: conv.item_details.name
        } : undefined
    };
}

function mapBackendMessage(msg: any): Message {
    return {
        id: msg.id.toString(),
        conversationId: msg.conversation.toString(),
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        isRead: msg.is_read
    };
}

export async function getConversations(userId: string): Promise<Conversation[]> {
    try {
        const data = await fetchApi(`/conversations/?user_id=${userId}`);
        return data.map((c: any) => mapBackendConversation(c, userId));
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        return [];
    }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    try {
        const data = await fetchApi(`/messages/?conversation_id=${conversationId}`);
        return data.map(mapBackendMessage);
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return [];
    }
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<Message | null> {
    try {
        const data = await fetchApi('/messages/', {
            method: 'POST',
            body: JSON.stringify({
                conversation: conversationId,
                sender_id: senderId,
                text: text
            })
        });
        clearApiCache(`/messages/?conversation_id=${conversationId}`);
        clearApiCache(`/conversations/?user_id=${senderId}`);
        return mapBackendMessage(data);
    } catch (error) {
        console.error("Failed to send message:", error);
        return null;
    }
}

export async function createConversation(participantIds: string[], itemId?: string): Promise<Conversation | null> {
    try {
        const data = await fetchApi('/conversations/', {
            method: 'POST',
            body: JSON.stringify({
                participant_ids: participantIds,
                item_context: itemId
            })
        });
        clearApiCache(`/conversations/?user_id=${participantIds[0]}`);
        return mapBackendConversation(data, participantIds[0]);
    } catch (error) {
        console.error("Failed to create conversation:", error);
        return null;
    }
}

export async function markMessageAsRead(messageId: string): Promise<void> {
    try {
        await fetchApi(`/messages/${messageId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ is_read: true })
        });
    } catch (error) {
        console.error("Failed to mark message as read:", error);
    }
}
