/**
 * Types TypeScript pour la messagerie interne
 *
 * @ticket SP-502
 */

import type { ConversationType, ConversationMemberRole, UserRole } from '@prisma/client'

// ============================================================================
// Message
// ============================================================================

export interface MessageSender {
  id: string
  name: string | null
  image: string | null
}

export interface AttachmentData {
  url: string
  name: string
  mimeType: string
  size: number
}

export interface MessageWithSender {
  id: string
  conversationId: string
  senderId: string | null
  sender: MessageSender | null
  content: string | null
  attachments: AttachmentData[] | null
  isDeleted: boolean
  createdAt: Date
}

// ============================================================================
// Conversation
// ============================================================================

export interface ConversationMemberInfo {
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  role: ConversationMemberRole
}

export interface ConversationListItem {
  id: string
  type: ConversationType
  name: string | null
  teamId: string | null
  avatarUrl: string | null
  lastMessageAt: Date | null
  lastMessagePreview: string | null
  members: ConversationMemberInfo[]
  unreadCount: number
  createdAt: Date
}

export interface ConversationWithDetails extends ConversationListItem {
  companyId: string | null
  createdById: string | null
}

// ============================================================================
// SSE Payloads
// ============================================================================

export interface SSENewMessagePayload {
  type: 'new_message'
  data: {
    conversationId: string
    message: MessageWithSender
  }
}

// ============================================================================
// API Responses
// ============================================================================

export interface MessagesPage {
  messages: MessageWithSender[]
  hasMore: boolean
}

// ============================================================================
// Admin — recherche cross-tenant (SP-515)
// ============================================================================

export interface UserForMessagingAdmin {
  id: string
  name: string | null
  image: string | null
  role: UserRole
  companyId: string | null
  companyName: string | null
}

export interface SearchUsersForAdminResult {
  users: UserForMessagingAdmin[]
  total: number
  hasMore: boolean
}
