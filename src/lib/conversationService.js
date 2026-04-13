/**
 * Conversation Service
 * Handles all API calls for conversation management
 * Backend handles all database operations
 */

import API_BASE from './apiConfig';

/**
 * Get all conversations for authenticated user
 */
export async function getUserConversations(userId, token) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(chatId, token) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${chatId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    return [];
  }
}

/**
 * Create new conversation
 */
export async function createConversation(userId, token, title = 'New Conversation') {
  try {
    const response = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        title: title
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const data = await response.json();
    return data.conversation;
  } catch (error) {
    return null;
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(chatId, token, title) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${chatId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: title
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.status}`);
    }

    const data = await response.json();
    return data.conversation;
  } catch (error) {
    return null;
  }
}

/**
 * Delete conversation
 */
export async function deleteConversation(chatId, token) {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Save message to conversation
 */
export async function saveMessage(chatId, userId, token, message, role = 'user') {
  try {
    const response = await fetch(`${API_BASE}/api/conversations/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        role: role,
        content: message,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.status}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    return null;
  }
}

/**
 * Get guest conversations (before migration)
 */
export async function getGuestConversations(guestUserId, apiKey) {
  try {
    const response = await fetch(`${API_BASE}/api/guest/conversations?guest_user_id=${guestUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch guest conversations: ${response.status}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    return [];
  }
}

/**
 * Save guest message
 */
export async function saveGuestMessage(guestUserId, apiKey, message, response) {
  try {
    const fetchResponse = await fetch(`${API_BASE}/api/guest/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        guest_user_id: guestUserId,
        user_message: message,
        ai_response: response,
        created_at: new Date().toISOString()
      })
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to save guest message: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    return data.message;
  } catch (error) {
    return null;
  }
}

/**
 * Generate conversation title from first message
 */
export function generateConversationTitle(message) {
  // Take first 50 characters of message as title
  const title = message.substring(0, 50).trim();
  return title.length > 0 ? title : 'New Conversation';
}

/**
 * Format conversation for display
 */
export function formatConversation(conversation) {
  return {
    id: conversation.id,
    title: conversation.title || 'Untitled',
    messageCount: conversation.message_count || 0,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    preview: conversation.preview || ''
  };
}

/**
 * Format message for display
 */
export function formatMessage(message) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.created_at,
    tokensUsed: message.tokens_used || 0,
    references: message.references || [],
    followups: message.followups || []
  };
}
