# Handdown Product Requirements Document

## 1. Product Context & Objectives

- **Product vision**: Handdown is a campus-focused marketplace that lets university students buy, sell, and transport second-hand goods safely within a trusted community.
- **Primary goals**
  - Surface recent listings in a mobile-first grid with infinite scroll to keep buyers engaged.
  - Let verified students publish, edit, and delete listings (photos, metadata, pricing) via lightweight workflows.
  - Provide rich listing detail pages highlighting seller profiles and enabling quick communication intent (message, bid, save, share).
  - Offer complementary services (e.g., moving assistance) that support high-friction transactions like furniture.
- **Target users**
  - Students searching for deals near campus (default schema `ucberkeley`).
  - Student sellers/off-campus movers who want to monetize items or services quickly.
  - Future extension to movers/logistics partners hinted at by the dedicated Moving tab.

## 2. Personas & User Journeys

### 2.1 Student Buyer (“Alex”)
- **Motivation**: Needs affordable furniture/electronics while staying local.
- **Journey**
  1. Lands on the Campus tab (`app/(tabs)/index.tsx`). Browses listings in the two-column grid.
  2. Scrolls infinitely; more results load via `fetchListings` when reaching the end.
  3. Taps a card → navigates to listing detail (`app/[id].tsx`) with carousel, description, seller info.
  4. Uses quick actions: send predefined message (creates conversation and navigates to Chats), bid, save, share (currently UI only).
  5. Checks seller credibility through profile snippet (rating, class year, major, campus region).
  6. Optionally opens Moving tab for delivery help or Profile tab to manage own info.
  7. Receives messages from sellers in Chats tab; responds to negotiate price, arrange pickup, ask questions.

### 2.2 Student Seller (“Jamie”)
- **Motivation**: Wants to offload items before moving, with minimal friction.
- **Journey**
  1. From Campus tab header, taps `Sell` to open Create Listing (`app/create_listing.tsx`).
  2. Uploads 1–10 photos, fills title, description, price, condition dropdown, category (Furniture/Apparel), and selects location placeholder.
  3. Validation ensures required fields before POSTing to `/listings/`.
  4. After publishing, they manage listings via Profile → “Your Listings”.
  5. `Your_Listings` (`app/Your_Listings.tsx`) shows fetched listings with edit/delete controls.
  6. Editing routes to Update Listing (`app/update_listing.tsx`), pre-populated either from navigation params or backend fetch.
  7. Changes saved via PUT to `/listings/update-listing-basic-info/{listing_id}`; deletes via DELETE `/listings/{id}`.
  8. Receives buyer inquiries via Chats tab; responds to negotiate, answer questions, coordinate meetups.

### 2.3 Student Mover (“Sam”)
- **Motivation**: Offers labor/logistics services to other students.
- **Journey**
  1. Opens Moving tab (`app/(tabs)/moving.tsx`).
  2. Chooses a service tier (Door to Door, Complete Move, Heavy Duty) — currently static UI buttons.
  3. Future iterations should collect requests and route them to movers; currently informational only.

### Supporting Journeys
- **Profile management**: `app/profile.tsx` fetches personal data via `GET /profile-page/{uid}` for display and navigation to selling tools.
- **Routing**: Expo Router defines stack + tab navigation, enabling deep links (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`).

## 3. Feature Requirements by Screen

### 3.1 Root + Tab Layout (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`)
- Provide Expo Router stack with `(tabs)` group plus 404 fallback.
- Tabs: Campus (`index`), Nearby, Moving, Chats.
- Consistent tab bar styling (inactive gray, active purple, flat background). Icons from MaterialCommunityIcons.

### 3.2 Campus / Landing Screen (`app/(tabs)/index.tsx`)
- **Data fetch**: On mount, call `GET /listings/get-batch-listings-by-recency?listing_query_str=...`.
  - Default query: `schema_name="ucberkeley"`, `limit=12`, optional `last_time`.
  - Maintain state: `listings`, `loading`, `hasMore`, `lastTime`.
- **UI**
  - Header: “Campus Circle” chip (future filters), `Sell` button (navigates `/create_listing`), search icon, profile icon.
  - Body: `FlatList` two columns, responsive card width.
  - Card shows price, title, first image or placeholder color.
  - Infinite scroll: `onEndReached` → `loadMore()`; `setHasMore(false)` when fewer than 12 returned.
  - Pull-to-refresh resets pagination.
- **Interactions**
  - Card press navigates to Listing Detail route with serialized params (including `listing_images` JSON).
  - Sell button opens creation flow; profile icon opens `/profile`.
  - Filter/search currently stubbed.

### 3.3 Listing Detail (`app/[id].tsx`)
- **Inputs**: Receives listing metadata via router params; fetches seller profile via `offering_uid`.
- **Components**
  - Image carousel (`FlatList`), supports placeholder slides if no images.
  - Price/title/description block.
  - Interaction bar: message composer (default text "Still selling? I'm interested :)"), action icons (Bid, Save, Share – placeholders).
    - Send button creates conversation and navigates to Chats tab (see Chats section for integration).
  - Seller card: profile photo/map placeholder, name, class year, major, rating stars, campus region.
- **Data**
  - `GET /profile-page/{offering_uid}?schema_name=ucberkeley` when page opens.
  - Utility functions for rating display and class year mapping.
- **Accessibility**: Header back button with `accessibilityLabel`, pagination dots for carousel.

### 3.4 Create Listing (`app/create_listing.tsx`)
- **Form Fields**: Photos (1–10), Title, Description, Price, Condition (New / Used variants), Category (Furniture/Apparel), Location placeholder.
- **Validation**: Each field required except location placeholder? currently enforced; numeric check for price.
- **Image Handling**: Requests media library permissions, uses Expo Image Picker; converts URIs to blobs for FormData upload.
- **Submission**
  - Builds payload with defaults (schema, offering UID, listing type = 1, region/campus placeholders).
  - POST `/listings/?listing_str=${encodedPayload}` with multipart images (key `images`).
  - Successful response routes to `/`.
- **UX**: Inline error labels, hero dropzone for photos, `Publish` CTA.

### 3.5 Update Listing (`app/update_listing.tsx`)
- **Prefill strategy**:
  - If navigated from `Your_Listings`, uses params (including serialized images/tags) to hydrate state.
  - Otherwise fetches `GET /listings/{listingId}`.
- **Form parity**: Same fields and validation as create screen.
- **Change tracking**:
  - Compares against `originalData`; builds `updateData` with only changed fields + `schema_name`.
  - Converts selected category to `tag_ids`.
- **Submission**: PUT `/listings/update-listing-basic-info/{listingId}`; image updates currently logged but not sent.
- **Navigation**: Cancel + Update buttons route back to `Your_Listings`.

### 3.6 Your Listings (`app/Your_Listings.tsx`)
- **Data fetch**: `GET /profile-page/get-profile-listings/{profileId}?schema_name=...`.
- **UI**: Scrollable list showing thumbnail, title, price/date, condition. Inline edit (pencil) and delete (trash) actions.
- **Deletion**: Confirmation modal, DELETE `/listings/{id}?schema_name=...`; updates local state & count.
- **Empty/Loading states**: “Loading your listings…” text; empty state messaging when none.

### 3.7 Profile (`app/profile.tsx`)
- **Data**: `GET /profile-page/{uid}?schema_name=...` (same structure as listing detail).
- **UI sections**
  - Header with Back button.
  - Profile card (avatar, name, year-major, fallback states for loading/error).
  - List rows: Location (shows campus region), Ratings (stub), Selling section with “Your Listings” link.
- **Purpose**: Gateway to selling tools and verifying identity info.

### 3.8 Moving (`app/(tabs)/moving.tsx`)
- **Static content**: Presents three service tiers with descriptions and pricing.
- **Actions**: Buttons not wired yet; profile icon navigates to `/profile`.
- **Future requirement**: Capture move requests, integrate scheduling and mover matching.

### 3.9 Nearby (`app/(tabs)/nearby.tsx`)
- Currently Expo starter content describing template features. Needs replacement with actual nearby listings map/feed.

### 3.10 Chats (`app/(tabs)/chats.tsx`)
- **Purpose**: Central hub for all buyer-seller conversations initiated from listings.
- **Primary View: Conversations List**
  - Displays all active conversations sorted by most recent message timestamp (descending).
  - Each conversation row shows:
    - Other participant's profile picture (or placeholder).
    - Participant name (buyer sees seller name, seller sees buyer name).
    - Associated listing thumbnail (if conversation started from a listing).
    - Last message preview (truncated to ~50 chars) with timestamp (relative: "2m ago", "1h ago", "Yesterday", or absolute date if >7 days).
    - Unread message indicator (badge count or visual dot) if any unread messages exist.
  - Empty state: "No conversations yet. Start messaging sellers from listing pages!"
  - Pull-to-refresh to sync latest messages.
- **Conversation Detail View** (navigated from list row)
  - Header: Back button, participant name/avatar, listing context (optional link back to listing).
  - Message list: Scrollable, newest at bottom. Messages display:
    - Sender avatar (if not current user).
    - Message bubble with timestamp (relative or absolute).
    - Sent vs received styling (right-aligned for sent, left for received).
    - Read receipts (optional: "Delivered", "Read" indicators).
  - Input area: Text input with send button (mirrors listing detail composer pattern).
  - Auto-scroll to bottom on new messages or when opening conversation.
- **Integration Points**
  - Listing Detail (`app/[id].tsx`): Message composer's "Send" button should:
    1. Create a new conversation if none exists with this seller for this listing.
    2. Send the initial message.
    3. Navigate to Chats tab and open the new conversation.
  - Deep linking: Support navigation to specific conversation via route params (e.g., `/chats?conversation_id=...`).
- **Real-time Updates** (future enhancement)
  - Polling or WebSocket integration to show new messages without manual refresh.
  - Push notifications for messages received while app is backgrounded.

### 3.11 Modal & Not Found (`app/modal.tsx`, `app/+not-found.tsx`)
- Modal: Example screen linking back to home.
- Not Found: Default fallback route with CTA to go home.

## 4. Data & API Contracts

### 4.1 Environment Configuration
- `EXPO_PUBLIC_API_BASE_URL` (required): Base URL for all fetch calls.
- Default schema inferred: `"ucberkeley"`.
- Hard-coded user/profile ID: `"51e242d0-e313-47f8-a881-27bba664a57b"` used across listing/profile requests (replace with auth-based value later).

### 4.2 Listings API
- **GET `/listings/get-batch-listings-by-recency`**
  - Query param: `listing_query_str` (URL-encoded JSON)
    - `schema_name`, `limit`, optional `last_time`, `filters`.
  - Response: `{ message, data: { listings: Listing[], last_time }, count }`.
- **POST `/listings/?listing_str=${encodedPayload}`**
  - Payload JSON (before encoding):
    ```
    {
      offering_uid: string,
      schema_name: string,
      listing_type: number,
      title: string,
      description: string,
      price: number,
      condition: string,
      region_id: number,
      tag_ids: number[],
      campus_region_id: number
    }
    ```
  - Body: multipart/form-data with `images` blobs.
- **PUT `/listings/update-listing-basic-info/{listingId}`**
  - Body JSON: `{ schema_name, title?, description?, price?, condition?, tag_ids?, region_id? }`.
- **DELETE `/listings/{listingId}?schema_name=...`**
  - Removes listing; response includes optional `{ message }`.
- **GET `/listings/{listingId}`**
  - Used to hydrate edit form when params missing; returns listing object with `thumbnail_url`, `other_images`, etc.

### 4.3 Profile API
- **GET `/profile-page/{uid}?schema_name=...`**
  - Response: `{ message, data: ProfileData[], count }`; UI uses first element.
  - Fields: `fname`, `lname`, `profile_pic_url`, `major_name`, `class_year`, `rating`, `campus_region`, timestamps.
- **GET `/profile-page/get-profile-listings/{uid}?schema_name=...`**
  - Response data consumed by `Your_Listings`.

### 4.4 Chats/Messaging API
- **GET `/chats/conversations?user_uid={uid}&schema_name=...`**
  - Returns list of all conversations for the user.
  - Response: `{ message, data: Conversation[], count }`.
  - Each conversation includes last message preview and unread count.
- **GET `/chats/conversations/{conversation_id}/messages?schema_name=...&limit=50&before_message_id=...`**
  - Fetches messages for a specific conversation with pagination.
  - Response: `{ message, data: { messages: Message[], has_more: boolean }, count }`.
  - Supports infinite scroll via `before_message_id` cursor.
- **POST `/chats/conversations`**
  - Creates a new conversation (if one doesn't exist) and sends initial message.
  - Body JSON:
    ```
    {
      listing_id: string | null,
      buyer_uid: string,
      seller_uid: string,
      initial_message: string,
      schema_name: string
    }
    ```
  - Response: `{ message, data: { conversation_id: string, message_id: string } }`.
  - If conversation already exists, returns existing `conversation_id` and creates new message.
- **POST `/chats/conversations/{conversation_id}/messages`**
  - Sends a new message in an existing conversation.
  - Body JSON: `{ sender_uid: string, content: string, schema_name: string }`.
  - Response: `{ message, data: { message_id: string, time_sent: string } }`.
- **PUT `/chats/conversations/{conversation_id}/read?user_uid={uid}&schema_name=...`**
  - Marks all messages in a conversation as read for the specified user.
  - Response: `{ message, data: { updated_count: number } }`.
- **GET `/chats/conversations/unread-count?user_uid={uid}&schema_name=...`**
  - Returns total unread message count across all conversations (for tab badge).
  - Response: `{ message, data: { total_unread: number } }`.

### 4.4 Data Models
- **Listing (UI)**
  - `id`, `price` (string formatted with `$`), `title`, `thumbnail_url`, `description`, `listing_type_id`, `time_created`, `time_updated`, `region_id`, `condition`, `listing_images[]`, `tags[]`, `offering_uid`.
- **Profile**
  - `uid`, personal details, academic info, rating, campus region, timestamps.
- **Image item**
  - `{ position: number; image_url: string }`, sorted by ascending position for thumbnails.
- **Conversation (Chats)**
  - `conversation_id: string`, `listing_id: string | null`, `listing_title: string | null`, `listing_thumbnail_url: string | null`, `other_participant_uid: string`, `other_participant_name: string`, `other_participant_avatar_url: string | null`, `last_message: string`, `last_message_timestamp: string`, `unread_count: number`, `time_created: string`.
- **Message**
  - `message_id: string`, `conversation_id: string`, `sender_uid: string`, `content: string`, `time_sent: string`, `time_read: string | null`, `is_read: boolean`.

## 5. Chats Feature Detailed Requirements

### 5.1 User Stories

**As a buyer (Alex):**
- I want to message a seller directly from a listing page so I can ask questions quickly.
- I want to see all my conversations in one place so I can track negotiations across multiple listings.
- I want to see unread message counts so I know when sellers have responded.
- I want to view conversation history so I can reference previous agreements.

**As a seller (Jamie):**
- I want to receive buyer messages in my Chats tab so I can respond promptly.
- I want to see which listing each conversation is about so I can provide context-appropriate responses.
- I want to know when messages are read so I can gauge buyer interest.

### 5.2 Functional Requirements

**Conversations List Screen (`app/(tabs)/chats.tsx`):**
1. **Data Loading**
   - On mount, fetch conversations via `GET /chats/conversations?user_uid={uid}&schema_name=...`.
   - Show loading spinner while fetching.
   - Handle empty state with helpful messaging.
   - Support pull-to-refresh to sync latest.

2. **Conversation Row Display**
   - Show participant avatar (or colored placeholder with initials).
   - Display participant name (full name from profile).
   - Show listing thumbnail if conversation is tied to a listing (small 40x40px image).
   - Preview last message (max 50 chars, truncate with ellipsis).
   - Show relative timestamp ("2m ago", "1h ago", "Yesterday", or "Jan 15" if older).
   - Display unread badge (red dot or count) if `unread_count > 0`.
   - Highlight row if unread messages exist (subtle background tint).

3. **Navigation**
   - Tapping a conversation row navigates to conversation detail view.
   - Pass `conversation_id` and optionally `listing_id` as route params.

4. **Sorting**
   - Sort by `last_message_timestamp` descending (most recent first).

**Conversation Detail Screen** (new route, e.g., `app/chats/[conversation_id].tsx`):
1. **Header**
   - Back button (navigates to Chats list).
   - Participant name and avatar.
   - Optional: Listing context card (thumbnail + title, links to listing detail).

2. **Message List**
   - Fetch messages via `GET /chats/conversations/{conversation_id}/messages`.
   - Display messages in chronological order (newest at bottom, oldest at top).
   - Auto-scroll to top on load and when new messages arrive.
   - Support infinite scroll to load older messages (pagination via `before_message_id`).
   - Message bubbles:
     - Sent messages: Right-aligned, purple/primary color background, white text.
     - Received messages: Left-aligned, light gray background, dark text.
     - Show sender avatar for received messages (small 32x32px).
     - Display timestamp below each message (relative: "2:30 PM" or "Yesterday 3:15 PM").
     - Optional read receipt: "Read" indicator for sent messages (if `is_read === true`).

3. **Message Input**
   - Text input at bottom (sticky, above keyboard).
   - Send button (enabled when input has content).
   - On send:
     - POST message via `/chats/conversations/{conversation_id}/messages`.
     - Optimistically add message to local state.
     - Clear input.
     - Mark conversation as read for current user.
   - Handle send errors gracefully (show toast/alert, revert optimistic update).

4. **Read Status**
   - On conversation open, mark as read via `PUT /chats/conversations/{conversation_id}/read`.
   - Update unread count in conversations list.

**Integration with Listing Detail (`app/[id].tsx`):**
1. **Message Composer Enhancement**
   - Current state: Text input with default "Still selling? I'm interested :)" and send button.
   - On send button press:
     - Check if conversation exists for this listing + seller + current user.
     - If not, create conversation via `POST /chats/conversations` with `listing_id`, `buyer_uid`, `seller_uid`, `initial_message`.
     - If exists, send message via `POST /chats/conversations/{conversation_id}/messages`.
     - Navigate to Chats tab and open the conversation (or show success toast and stay on listing).
   - Show loading state during send.
   - Handle errors (network, validation) with user-friendly messages.

### 5.3 UI/UX Requirements

**Design Consistency:**
- Use React Native Paper components (Surface, Card, TextInput, IconButton) to match existing screens.
- Follow color scheme: Primary purple (#6222B1, #8B5CF6) for sent messages, light gray for received.
- Typography: Match existing font sizes (16px body, 14px timestamps, 12px metadata).

**Accessibility:**
- Add `accessibilityLabel` to all interactive elements.
- Support screen readers for message content and timestamps.
- Ensure proper focus order (input → send button → back button).

**Performance:**
- Lazy load conversation list (pagination if >50 conversations).
- Implement message pagination (load 50 at a time, infinite scroll).
- Debounce read status updates to avoid excessive API calls.
- Cache conversation metadata to reduce redundant fetches.

**Error Handling:**
- Network errors: Show retry button or auto-retry with exponential backoff.
- Empty states: Clear messaging for no conversations, no messages in conversation.
- Loading states: Skeleton loaders or spinners for initial loads.

### 5.4 Technical Implementation Notes

**State Management:**
- Use React hooks (`useState`, `useEffect`) for local state (messages, conversations, loading).
- Consider context or state management library if real-time updates are added later.

**Navigation:**
- Use Expo Router for navigation between Chats list and conversation detail.
- Support deep linking: `/chats?conversation_id={id}` opens specific conversation.

**Real-time Updates (Future):**
- Polling: Refresh conversations list every 30 seconds when Chats tab is active.
- WebSocket: Subscribe to conversation updates for active conversation.
- Push notifications: Alert users of new messages when app is backgrounded.

**Data Persistence (Future):**
- Cache conversations and messages locally (AsyncStorage or SQLite) for offline support.
- Sync on app launch and when tab becomes active.

## 6. Non-Functional Requirements & Open Issues

- **Performance**
  - Infinite scroll should debounce duplicate fetches; `loading` guard already prevents overlap.
  - Image handling currently fetches each URI to blob before upload; consider compression & background uploads.
  - Prefetch seller profiles or cache to avoid duplicate requests when navigating between listing detail and profile.
- **Platform dependencies**
  - Expo Router for navigation.
  - React Native Paper for UI primitives (Appbar, Card, Button, Surface).
  - Expo Image Picker for media selection.
- **Security / Auth**
  - Uses hard-coded `offering_uid` and schema; needs integration with authentication/session management.
  - No input sanitization beyond basic validation; server-side validation assumed.
- **Accessibility**
  - Partial support (labels on key buttons). Need full audit for TalkBack/VoiceOver (focus order, role props).
- **Known gaps / placeholders**
  - Search/filter actions are non-functional on Campus header.
  - Chats tab implementation in progress (see Section 3.10 for requirements).
  - Bid/save/share buttons on listing detail lack backend integration.
  - Nearby tab uses template text; needs actual nearby listing logic (geo-filter, map).
  - Moving tab lacks request form, scheduling, or dispatcher flow.
  - Location picker in create/update listing uses placeholder string.
  - Image editing/reordering during update not implemented; image PUT endpoint still TODO.
- **Future opportunities**
  - Add analytics for listing impressions/conversions.
  - Support saved searches, push notifications, verification badges.
  - Introduce mover marketplace backend and scheduling UI within Moving tab.
  - Real-time messaging via WebSocket for instant message delivery.
  - Message search within conversations.
  - Image/file sharing in messages.
  - Typing indicators ("Seller is typing...").
  - Message reactions (emoji responses).


