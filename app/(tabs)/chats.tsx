/**
 * Chats Screen
 *
 * Displays all conversations for the current user (both as buyer and seller).
 * Each chat tile shows: item picture, participant name, and last message time.
 * Conversations are sorted by last message timestamp (descending).
 * Ready for API integration once backend endpoints are available.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

/**
 * Conversation data structure matching the API response format
 * This matches the Conversation interface defined in the PRD
 */
interface Conversation {
  conversation_id: string;
  listing_id: string | null;
  listing_title: string | null;
  listing_thumbnail_url: string | null;
  other_participant_uid: string;
  other_participant_name: string;
  other_participant_avatar_url: string | null;
  last_message: string | null;
  last_message_timestamp: string;
  unread_count: number;
  time_created: string;
}

/**
 * Formats timestamp to relative or absolute time display
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted time string ("2m ago", "1h ago", "Yesterday", "Jan 15", etc.)
 */
const formatMessageTime = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffMs = now.getTime() - messageTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute ago
  if (diffMins < 1) {
    return 'Just now';
  }
  // Less than 1 hour ago
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  // Less than 24 hours ago
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  // More than 7 days ago - show absolute date
  if (diffDays > 7) {
    return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  // Between 2-7 days ago
  return `${diffDays}d ago`;
};

/**
 * ChatTile Component
 * 
 * Displays a single conversation tile with:
 * - Item picture (thumbnail from listing)
 * - Participant name
 * - Last message time
 * - Optional unread badge
 */
interface ChatTileProps {
  conversation: Conversation;
  onPress: () => void;
}

const ChatTile: React.FC<ChatTileProps> = ({ conversation, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.chatTile}>
        <Card.Content style={styles.tileContent}>
          {/* Item Picture - thumbnail from listing */}
          <View style={styles.imageContainer}>
            {conversation.listing_thumbnail_url ? (
              <Image
                source={{ uri: conversation.listing_thumbnail_url }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.imagePlaceholder]}>
                <MaterialCommunityIcons 
                  name="image-off-outline" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
            )}
          </View>

          {/* Participant Name and Time */}
          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.participantName} numberOfLines={1}>
                {conversation.other_participant_name}
              </Text>
              <Text style={styles.timeText}>
                {formatMessageTime(conversation.last_message_timestamp)}
              </Text>
            </View>
            
            {/* Optional: Last message preview (can be enabled later) */}
            {conversation.last_message && (
              <Text style={styles.lastMessagePreview} numberOfLines={1}>
                {conversation.last_message.length > 50 
                  ? `${conversation.last_message.substring(0, 50)}...` 
                  : conversation.last_message}
              </Text>
            )}
          </View>

          {/* Unread Badge */}
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
};

/**
 * Main Chats Screen Component
 * 
 * Displays list of all conversations sorted by last message time (descending).
 * Supports pull-to-refresh and shows empty/loading states.
 */
export default function ChatsScreen() {
  const theme = useTheme();
  
  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Hardcoded example conversations for development
   * These will be replaced with API calls once backend is ready
   * 
   * TODO: Replace with API call to GET /chats/conversations?user_uid={uid}&schema_name={schema_name}
   */
  const loadConversations = useCallback(() => {
    // Simulate API loading delay
    setLoading(true);
    
    // Hardcoded example data matching the Conversation interface
    const mockConversations: Conversation[] = [
      {
        conversation_id: 'conv-1',
        listing_id: 'listing-1',
        listing_title: 'Vintage Desk Chair',
        listing_thumbnail_url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
        other_participant_uid: 'user-2',
        other_participant_name: 'Alex Johnson',
        other_participant_avatar_url: null,
        last_message: 'Sounds good! When can you pick it up?',
        last_message_timestamp: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
        unread_count: 2,
        time_created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        conversation_id: 'conv-2',
        listing_id: 'listing-2',
        listing_title: 'Textbooks Bundle',
        listing_thumbnail_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
        other_participant_uid: 'user-3',
        other_participant_name: 'Sarah Chen',
        other_participant_avatar_url: null,
        last_message: 'I can meet you at the library tomorrow',
        last_message_timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
        unread_count: 0,
        time_created: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        conversation_id: 'conv-3',
        listing_id: 'listing-3',
        listing_title: 'Coffee Maker',
        listing_thumbnail_url: 'https://images.unsplash.com/photo-1517668808823-f8c76a90e0a1?w=400',
        other_participant_uid: 'user-4',
        other_participant_name: 'Michael Park',
        other_participant_avatar_url: null,
        last_message: 'Is it still available?',
        last_message_timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
        unread_count: 1,
        time_created: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
      {
        conversation_id: 'conv-4',
        listing_id: null,
        listing_title: null,
        listing_thumbnail_url: null,
        other_participant_uid: 'user-5',
        other_participant_name: 'Emma Wilson',
        other_participant_avatar_url: null,
        last_message: 'Thanks for the quick response!',
        last_message_timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        unread_count: 0,
        time_created: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        conversation_id: 'conv-5',
        listing_id: 'listing-5',
        listing_title: 'Bike Lock',
        listing_thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        other_participant_uid: 'user-6',
        other_participant_name: 'David Kim',
        other_participant_avatar_url: null,
        last_message: 'Perfect condition, barely used',
        last_message_timestamp: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
        unread_count: 0,
        time_created: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      },
    ];

    // Simulate network delay
    setTimeout(() => {
      // Sort by last_message_timestamp descending (most recent first)
      const sortedConversations = [...mockConversations].sort((a, b) => {
        return new Date(b.last_message_timestamp).getTime() - new Date(a.last_message_timestamp).getTime();
      });
      
      setConversations(sortedConversations);
      setLoading(false);
      setRefreshing(false);
    }, 500);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Handle pull-to-refresh
   * TODO: Replace with actual API refresh call
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  /**
   * Handle conversation tile press
   * TODO: Navigate to conversation detail screen
   */
  const handleConversationPress = useCallback((conversation: Conversation) => {
    // TODO: Navigate to conversation detail screen
    // router.push({
    //   pathname: '/chats/[conversation_id]',
    //   params: { conversation_id: conversation.conversation_id }
    // });
    console.log('Conversation pressed:', conversation.conversation_id);
  }, []);

  /**
   * Render individual conversation tile
   */
  const renderConversation = useCallback(({ item }: { item: Conversation }) => (
    <ChatTile
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  ), [handleConversationPress]);

  /**
   * Extract unique key for each conversation
   */
  const keyExtractor = useCallback((item: Conversation) => item.conversation_id, []);

  /**
   * Render empty state when no conversations exist
   */
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyStateText}>Loading conversations...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons 
          name="chat-outline" 
          size={64} 
          color="#ccc" 
          style={styles.emptyStateIcon}
        />
        <Text style={styles.emptyStateText}>No conversations yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Start messaging sellers from listing pages!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  chatTile: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: '#fff',
  },
  tileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
  },
  lastMessagePreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
