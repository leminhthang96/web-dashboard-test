# Database Schema

<cite>
**Referenced Files in This Document**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/admin/users/[uid]/route.ts](file://src/app/api/admin/users/[uid]/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/documents/services/types/folder-types.ts](file://src/modules/documents/services/types/folder-types.ts)
- [modules/documents/components/folder-form-dialog.tsx](file://src/modules/documents/components/folder-form-dialog.tsx)
- [modules/documents/components/folder-tree.tsx](file://src/modules/documents/components/folder-tree.tsx)
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive Folder Entity documentation with folder types and hierarchical relationships
- Updated Documents Entity to include document-folder associations and folder-based organization
- Enhanced Security Rules section with folder-specific access control patterns
- Added new Folder Services and Types sections covering folder management functionality
- Updated dependency analysis to include folder-related components and services
- Expanded performance considerations for folder hierarchy queries and document-folder relationships

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Security Rules Implementation](#security-rules-implementation)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
This document provides a comprehensive Firebase Firestore schema and operational guide for the project. It covers entity relationships, field definitions, data types, indexing strategies, **enhanced security rules with row-level access control**, validation constraints, query optimization patterns, migration procedures, backup strategies, data integrity measures, performance considerations, caching strategies, and offline synchronization approaches. The guidance is derived from the repository's API routes, module services, and **comprehensive Firestore security rules implementation** to ensure alignment with actual implementation patterns. **Updated to include the new folder management system with hierarchical folder structures, folder types, and document-folder associations.**

## Project Structure
The application follows a Next.js App Router structure with feature modules under src/modules and server-side API routes under src/app/api. Firestore access uses the Firebase client SDK and is constrained by Security Rules, while client-side modules encapsulate domain-specific logic and UI components. **Enhanced Firestore security rules are defined at the root level to enforce fine-grained access control at the database layer with row-level security patterns.**

```mermaid
graph TB
Client["Client App<br/>Next.js Pages/Components"] --> API["API Routes<br/>src/app/api/*"]
API --> Services["Module Services<br/>src/modules/*/services/*"]
Services --> Firestore["Firestore Database"]
Security["Enhanced Firestore Rules<br/>Row-Level Security<br/>Role-Based Access Control"] --> Firestore
Auth["Authentication Layer<br/>Enhanced Permissions"] --> API
FolderSystem["Folder Management System<br/>Hierarchical Folders<br/>Document Associations"] --> Firestore
```

**Diagram sources**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

**Section sources**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

## Core Components
- API Routes: Central entry points for CRUD operations on entities such as users, customers, tasks, and chat data. They validate requests, enforce authentication/authorization, and delegate persistence to service layers or direct Firestore calls.
- Module Services: Domain-specific services encapsulating business logic, data transformations, and Firestore interactions for features like chat, calendar, customers, documents, tasks, users, and **folder management**.
- **Enhanced Security Rules**: **Comprehensive Firestore rules with row-level security, granular access control for users/tasks/admin roles, and enhanced authentication permissions define read/write permissions based on authenticated user context, resource ownership, and role-based authorization.**
- **Folder Management System**: **New hierarchical folder structure supporting nested folders, folder types, and document associations with comprehensive access control and relationship management.**

Key responsibilities:
- Request validation and sanitization within API routes.
- **Enhanced authorization checks using session tokens, role-based access, and row-level security validation.**
- Data normalization and type enforcement in service layers.
- Efficient querying and batching where applicable.
- **Folder hierarchy navigation and document-folder relationship management.**

**Section sources**
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/admin/users/[uid]/route.ts](file://src/app/api/admin/users/[uid]/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
- [firestore.rules](file://firestore.rules)

## Architecture Overview
The system uses a layered architecture with **enhanced security enforcement**:
- Presentation Layer: Next.js pages and components.
- API Layer: Route handlers orchestrating request/response flows with **enhanced authentication and authorization**.
- Service Layer: Feature-specific logic and data operations including **folder management services**.
- Persistence Layer: Firestore via Admin SDK or client SDK depending on context.
- **Enhanced Security Layer**: **Comprehensive Firestore rules enforcing fine-grained access control with row-level security, role-based permissions, and enhanced authentication validation.**

```mermaid
sequenceDiagram
participant Client as "Client"
participant Auth as "Enhanced Auth"
participant API as "API Route"
participant Service as "Module Service"
participant FolderService as "Folder Service"
participant DB as "Firestore"
participant Rules as "Enhanced Security Rules"
Client->>Auth : Authentication Request
Auth-->>Client : Enhanced Token
Client->>API : HTTP Request with Token
API->>API : Validate & Enhanced Authorization
API->>Service : Business Logic
Service->>FolderService : Folder Operations
FolderService->>DB : Folder/Document Queries
DB-->>FolderService : Folder/Document Data
FolderService-->>Service : Results
Service-->>API : Result
API-->>Client : Response
Note over DB,Rules : Row-level security enforced by Enhanced Firestore Rules
```

**Diagram sources**
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [firestore.rules](file://firestore.rules)

## Detailed Component Analysis

### Users Entity
- Purpose: Represents system users and roles; supports admin management endpoints.
- Typical fields: id (string), email (string), displayName (string), role (enum), createdAt (timestamp), updatedAt (timestamp), metadata (map).
- Relationships: Users may be linked to tasks, customers, chat conversations, and **folders** via references or IDs.
- Indexing strategy: Composite indexes on email and role for filtering; timestamp fields for sorting and pagination.
- Validation constraints: Email format, required fields, role enum values.
- **Enhanced Security Rules**: **Row-level security with granular role-based access control. Admins have full CRUD access to all users. Regular users can only read their own profile and update limited fields. Role assignments require admin privileges with enhanced permission validation.**

```mermaid
classDiagram
class User {
+string id
+string email
+string displayName
+string role
+timestamp createdAt
+timestamp updatedAt
+map metadata
}
class UserRole {
+string id
+string name
+array permissions
}
User --> UserRole : "has role"
class SecurityPolicy {
+string adminAccess
+string selfAccess
+string roleManagement
}
UserRole --> SecurityPolicy : "enforces"
```

**Diagram sources**
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/admin/users/[uid]/route.ts](file://src/app/api/admin/users/[uid]/route.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/admin/users/[uid]/route.ts](file://src/app/api/admin/users/[uid]/route.ts)
- [firestore.rules](file://firestore.rules)

### Customers Entity
- Purpose: Stores customer records for CRM-like functionality.
- Typical fields: id (string), companyName (string), contactEmail (string), status (enum), tags (array), owner (string), createdAt (timestamp), updatedAt (timestamp).
- Relationships: Linked to tasks, documents, and **folders** via IDs.
- Indexing strategy: Composite indexes on status and tags for filtering; email for lookups; owner for row-level access.
- Validation constraints: Required company name and email; status enum validation.
- **Enhanced Security Rules**: **Comprehensive row-level security implementation. Each customer record includes an owner field for access control. Users can only read/write customers they own. Admins have full access to all customer records. Enhanced validation ensures proper ownership verification before any data operations.**

```mermaid
classDiagram
class Customer {
+string id
+string companyName
+string contactEmail
+string status
+array tags
+string owner
+timestamp createdAt
+timestamp updatedAt
}
class RowLevelSecurity {
+string ownerValidation
+string adminOverride
+string accessControl
}
Customer --> RowLevelSecurity : "enforced by"
Customer --> Task : "related"
Customer --> Document : "related"
Customer --> Folder : "organized in"
```

**Diagram sources**
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [firestore.rules](file://firestore.rules)

### Tasks Entity
- Purpose: Manages task items with assignments and statuses.
- Typical fields: id (string), title (string), description (string), assigneeId (string), customerId (string), status (enum), priority (enum), dueDate (timestamp), createdBy (string), createdAt (timestamp), updatedAt (timestamp).
- Relationships: Assignee links to User; optional link to Customer; **documents can be organized in folders associated with tasks**.
- Indexing strategy: Composite indexes on assigneeId and status; dueDate for time-based queries; createdBy for ownership.
- Validation constraints: Required title and status; valid assigneeId reference.
- **Enhanced Security Rules**: **Granular access control based on task assignment and ownership. Assignees can update task status and details. Original creators can modify non-sensitive fields. Admins have full access. Enhanced validation prevents unauthorized status changes and ensures proper assignment verification.**

```mermaid
classDiagram
class Task {
+string id
+string title
+string description
+string assigneeId
+string customerId
+string status
+string priority
+string createdBy
+timestamp dueDate
+timestamp createdAt
+timestamp updatedAt
}
class TaskAccessControl {
+string assigneeAccess
+string creatorAccess
+string adminAccess
+string statusValidation
}
Task --> TaskAccessControl : "enforced by"
Task --> User : "assignee"
Task --> Customer : "customer"
Task --> Folder : "document organization"
```

**Diagram sources**
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [firestore.rules](file://firestore.rules)

### Chat Entities
- Conversations: Group messages between participants.
- Messages: Individual chat entries with sender, content, timestamps.
- Typical fields:
  - Conversation: id, participants (array), lastMessageAt (timestamp), createdAt (timestamp).
  - Message: id, conversationId (string), senderId (string), content (string), sentAt (timestamp).
- Relationships: Messages belong to a Conversation; sender links to User.
- Indexing strategy: Composite indexes on conversationId and sentAt for ordering; participants array for membership queries.
- Validation constraints: Required senderId and content; conversationId must exist.
- **Enhanced Security Rules**: **Participant-based access control with enhanced validation. Only conversation participants can read/write messages. Enhanced authentication ensures sender identity verification. Admins can access all conversations for moderation purposes.**

```mermaid
classDiagram
class Conversation {
+string id
+array participants
+timestamp lastMessageAt
+timestamp createdAt
}
class Message {
+string id
+string conversationId
+string senderId
+string content
+timestamp sentAt
}
class ParticipantAccess {
+string participantValidation
+string senderVerification
+string adminOverride
}
Conversation ||--o{ Message : "contains"
Message --> User : "sender"
Message --> ParticipantAccess : "enforced by"
```

**Diagram sources**
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [firestore.rules](file://firestore.rules)

### Calendar Entities
- Calendars: Collections of events per user or team.
- Events: Scheduled items with start/end times and attendees.
- Typical fields:
  - Calendar: id, ownerId (string), name (string), createdAt (timestamp).
  - Event: id, calendarId (string), title (string), startTime (timestamp), endTime (timestamp), attendees (array), createdBy (string), createdAt (timestamp).
- Relationships: Events belong to a Calendar; attendees link to Users.
- Indexing strategy: Composite indexes on calendarId and startTime for range queries; attendees for availability checks.
- Validation constraints: Required title and valid time range; calendarId must exist.
- **Enhanced Security Rules**: **Owner and attendee-based access control with enhanced validation. Calendar owners have full control. Attendees can view events but limited modification rights. Enhanced authentication verifies attendee status before granting write access.**

```mermaid
classDiagram
class Calendar {
+string id
+string ownerId
+string name
+timestamp createdAt
}
class Event {
+string id
+string calendarId
+string title
+timestamp startTime
+timestamp endTime
+array attendees
+string createdBy
+timestamp createdAt
}
class CalendarAccessControl {
+string ownerAccess
+string attendeeAccess
+string eventModification
}
Calendar ||--o{ Event : "contains"
Event --> User : "attendee"
Event --> CalendarAccessControl : "enforced by"
```

**Diagram sources**
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [firestore.rules](file://firestore.rules)

### Documents Entity
- Purpose: Stores file metadata and references for uploaded documents.
- Typical fields: id (string), name (string), mimeType (string), size (number), storagePath (string), uploadedBy (string), folderId (string), createdAt (timestamp), updatedAt (timestamp).
- Relationships: UploadedBy links to User; optional association to Customer or Task; **now includes folderId for hierarchical organization**.
- Indexing strategy: Indexes on uploadedBy and createdAt for listing; mimeType for filtering; **folderId for folder-based queries**.
- Validation constraints: Required name and storagePath; size within limits; **valid folderId reference when assigned**.
- **Enhanced Security Rules**: **Uploader-based access control with enhanced validation. Uploaders can manage their files with restricted permissions. Enhanced authentication verifies uploader identity. Admins have full access for system maintenance. **Documents inherit folder access permissions when organized in shared folders.****

```mermaid
classDiagram
class Document {
+string id
+string name
+string mimeType
+number size
+string storagePath
+string uploadedBy
+string folderId
+timestamp createdAt
+timestamp updatedAt
}
class DocumentAccessControl {
+string uploaderAccess
+string adminAccess
+string uploadVerification
+string folderInheritance
}
Document --> User : "uploadedBy"
Document --> Folder : "organized in"
Document --> DocumentAccessControl : "enforced by"
```

**Diagram sources**
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [firestore.rules](file://firestore.rules)

### Folder Entity
- Purpose: **Manages hierarchical folder structures for organizing documents and other resources.**
- Typical fields: id (string), name (string), parentId (string), type (enum), ownerId (string), path (string), depth (number), sortOrder (number), createdAt (timestamp), updatedAt (timestamp).
- Relationships: **Parent-child relationships through parentId; documents can be associated via folderId; owner-based access control.**
- Indexing strategy: **Composite indexes on parentId and depth for hierarchy traversal; ownerId for ownership queries; path for efficient path-based lookups.**
- Validation constraints: **Required name and ownerId; valid parentId reference for parent folders; unique path within scope; depth validation to prevent excessive nesting.**
- **Enhanced Security Rules**: **Owner-based access control with inheritance from parent folders. Folder owners have full control over subfolders and contained documents. Enhanced validation ensures proper hierarchy maintenance and prevents circular references.**

```mermaid
classDiagram
class Folder {
+string id
+string name
+string parentId
+string type
+string ownerId
+string path
+number depth
+number sortOrder
+timestamp createdAt
+timestamp updatedAt
}
class FolderHierarchy {
+string parentChildRelationship
+string pathTraversal
+string depthLimit
+string circularReferencePrevention
}
class FolderAccessControl {
+string ownerAccess
+string inheritedPermissions
+string subfolderControl
+string documentAssociation
}
Folder --> Folder : "parent-child"
Folder --> Document : "contains"
Folder --> FolderHierarchy : "enforced by"
Folder --> FolderAccessControl : "secured by"
```

**Diagram sources**
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/documents/services/types/folder-types.ts](file://src/modules/documents/services/types/folder-types.ts)
- [modules/documents/components/folder-form-dialog.tsx](file://src/modules/documents/components/folder-form-dialog.tsx)
- [modules/documents/components/folder-tree.tsx](file://src/modules/documents/components/folder-tree.tsx)
- [firestore.rules](file://firestore.rules)

**Section sources**
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/documents/services/types/folder-types.ts](file://src/modules/documents/services/types/folder-types.ts)
- [modules/documents/components/folder-form-dialog.tsx](file://src/modules/documents/components/folder-form-dialog.tsx)
- [modules/documents/components/folder-tree.tsx](file://src/modules/documents/components/folder-tree.tsx)
- [firestore.rules](file://firestore.rules)

## Security Rules Implementation

### Comprehensive Row-Level Security
**Updated** The security rules implementation now provides comprehensive row-level security across all entities with granular access control patterns, **including enhanced folder-based access control and document-folder relationship security.**

#### Customers Row-Level Security
- Owner-based access control with enhanced validation
- Admin override capabilities for system administration
- Field-level restrictions for sensitive data
- Audit trail integration for compliance

#### Users Role-Based Access Control
- Granular role hierarchy with enhanced permissions
- Self-service profile management with field restrictions
- Admin-only role assignment and user management
- Enhanced authentication token validation

#### Tasks Assignment-Based Security
- Assignee-based modification rights with validation
- Creator-based ownership controls
- Status change restrictions with enhanced verification
- Cross-entity relationship validation

#### **Folders Hierarchical Access Control**
- **Owner-based access with inheritance from parent folders**
- **Subfolder creation and management permissions**
- **Document association security within folder context**
- **Path-based access validation for efficient hierarchy traversal**
- **Circular reference prevention and depth limit enforcement**

#### Enhanced Authentication Permissions
- Multi-layered authentication validation
- Session token verification with enhanced security
- Role-based middleware integration
- Permission inheritance and cascading rules

```mermaid
flowchart TD
A[Request] --> B[Enhanced Authentication]
B --> C{Valid Token?}
C --> |No| D[Deny Access]
C --> |Yes| E[Role Verification]
E --> F{Admin Role?}
F --> |Yes| G[Full Access]
F --> |No| H[Resource Type Check]
H --> I{Folder Operation?}
I --> |Yes| J[Folder Hierarchy Validation]
J --> K[Owner/Permission Check]
K --> L[Inherited Access Validation]
L --> M[Execute Folder Operation]
I --> |No| N[Row-Level Check]
N --> O{Owner/Assignee?}
O --> |Yes| P[Conditional Access]
O --> |No| Q[Deny Access]
P --> R[Field-Level Validation]
R --> S[Execute Operation]
M --> T[Return Success]
S --> T
G --> T
D --> U[Return Error]
Q --> U
```

**Diagram sources**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

**Section sources**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

## Dependency Analysis
The following diagram illustrates dependencies among API routes, module services, and **enhanced** Firestore rules, **including the new folder management system:**

```mermaid
graph LR
API_Admin_Users["API /admin/users"] --> Service_Users["User Services"]
API_Customers["API /customers"] --> Service_Customers["Customer Services"]
API_Tasks["API /tasks"] --> Service_Tasks["Task Services"]
Service_Chat["Chat Services"] --> Firestore["Firestore"]
Service_Calendar["Calendar Services"] --> Firestore
Service_Customers --> Firestore
Service_Documents["Document Services"] --> Firestore
Service_Folders["Folder Services"] --> Firestore
Service_Tasks --> Firestore
Service_Users --> Firestore
Enhanced_Rules["Enhanced Firestore Rules<br/>Row-Level Security<br/>Role-Based Access<br/>Folder Hierarchy Security"] --> Firestore
Auth_Layer["Enhanced Authentication<br/>Permission Validation"] --> API_Admin_Users
Auth_Layer --> API_Customers
Auth_Layer --> API_Tasks
Folder_UI["Folder UI Components<br/>Folder Tree & Forms"] --> Service_Folders
```

**Diagram sources**
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/documents/components/folder-form-dialog.tsx](file://src/modules/documents/components/folder-form-dialog.tsx)
- [modules/documents/components/folder-tree.tsx](file://src/modules/documents/components/folder-tree.tsx)
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)

**Section sources**
- [api/admin/users/route.ts](file://src/app/api/admin/users/route.ts)
- [api/customers/route.ts](file://src/app/api/customers/route.ts)
- [api/tasks/route.ts](file://src/app/api/tasks/route.ts)
- [modules/chat/services/chat-services.ts](file://src/modules/chat/services/chat-services.ts)
- [modules/calendar/services/calendar-services.ts](file://src/modules/calendar/services/calendar-services.ts)
- [modules/customers/services/customer-services.ts](file://src/modules/customers/services/customer-services.ts)
- [modules/documents/services/document-file-services.ts](file://src/modules/documents/services/document-file-services.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)
- [modules/documents/components/folder-form-dialog.tsx](file://src/modules/documents/components/folder-form-dialog.tsx)
- [modules/documents/components/folder-tree.tsx](file://src/modules/documents/components/folder-tree.tsx)
- [modules/tasks/services/task-services.ts](file://src/modules/tasks/services/task-services.ts)
- [modules/users/services/user-services.ts](file://src/modules/users/services/user-services.ts)
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)

## Performance Considerations
- Indexing Strategy:
  - Use composite indexes for common filter/sort combinations (e.g., status + dueDate, assigneeId + status).
  - **Optimize indexes for row-level security queries including owner, assignee, and participant fields.**
  - **Create specialized indexes for folder hierarchy traversal including parentId + depth, path prefix matching, and ownerId + sortOrder.**
  - Avoid wildcard queries on arrays; precompute counts where necessary.
- Query Optimization:
  - Prefer specific field selections to reduce payload size.
  - Paginate results using cursor-based pagination for large collections.
  - Batch writes to minimize round trips and improve throughput.
  - **Leverage security rule-friendly query patterns to minimize rule evaluation overhead.**
  - **Use path-based queries for efficient folder hierarchy navigation instead of recursive parent lookups.**
- Caching Strategies:
  - Implement client-side caching for static or infrequently changing data (e.g., roles, configurations).
  - Use optimistic updates for responsive UI during write operations.
  - **Cache security policy decisions to reduce repeated authentication checks.**
  - **Implement folder hierarchy caching to optimize tree rendering and navigation.**
- Offline Synchronization:
  - Leverage Firestore offline persistence for mobile/web clients to cache data locally.
  - Handle conflict resolution with versioned fields and merge strategies.
  - **Implement offline security policy validation for consistent behavior.**
  - **Handle folder hierarchy conflicts with careful parent-child relationship resolution.**
- **Enhanced Security Rule Efficiency**:
  - **Keep rules simple and avoid expensive computations; use indexed fields for conditions.**
  - **Deny-by-default and explicitly allow necessary operations.**
  - **Optimize row-level security checks for better performance.**
  - **Use efficient authentication token parsing and validation.**
  - **Implement efficient folder permission inheritance calculations.**

## Troubleshooting Guide
Common issues and resolutions:
- **Enhanced Authentication Failures**:
  - Verify token validity and expiration; ensure proper session handling in API routes.
  - Check NextAuth configuration and environment variables.
  - **Validate enhanced authentication permissions and role assignments.**
- **Permission Denied Errors**:
  - Review **enhanced** Firestore rules for targeted collections and fields.
  - Confirm user roles and ownership claims in tokens.
  - **Check row-level security policies and access control lists.**
  - **Verify assignment-based permissions for tasks and participant-based access for chats.**
  - **Validate folder hierarchy permissions and inherited access controls.**
- **Folder Hierarchy Issues**:
  - **Check for circular references in folder parent-child relationships.**
  - **Validate folder depth limits and path uniqueness constraints.**
  - **Ensure proper folder permission inheritance for nested structures.**
- Query Timeouts:
  - Inspect missing or incorrect indexes; add composite indexes as needed.
  - Optimize queries to limit result sets and avoid deep nesting.
  - **Ensure security rule queries are properly indexed.**
  - **Optimize folder hierarchy traversal queries with appropriate path-based indexing.**
- Data Integrity Violations:
  - Enforce validation at API and service layers; use consistent schemas.
  - Implement transactions for multi-document updates to maintain consistency.
  - **Validate enhanced security constraints during data operations.**
  - **Maintain folder hierarchy integrity during bulk operations.**

**Section sources**
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [firestore.rules](file://firestore.rules)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

## Conclusion
This documentation outlines the Firestore schema, relationships, and operational practices aligned with the project's codebase. **The comprehensive security rules implementation with row-level access control, granular role-based permissions, enhanced authentication, and the new folder management system provides robust data protection and hierarchical organization capabilities.** By adhering to the recommended indexing, validation, and security patterns, the system can achieve reliable performance, strong data integrity, scalable access control, and efficient folder hierarchy management. Continuous monitoring and iterative refinement of rules, queries, and folder operations will further enhance reliability and efficiency.

## Appendices

### Enhanced Security Rules Summary
- **Default deny all reads/writes unless explicitly allowed.**
- **Row-level security for customers with owner-based access control.**
- **Granular role-based access for users with enhanced permission validation.**
- **Assignment-based access control for tasks with status change restrictions.**
- **Participant-based access for chat conversations and messages.**
- **Owner/attendee checks for calendars and events.**
- **Enhanced authentication permissions with multi-layered validation.**
- **Admin override capabilities for system administration.**
- **Hierarchical folder access control with permission inheritance.**
- **Document-folder relationship security with folder-based access inheritance.**

**Section sources**
- [firestore.rules](file://firestore.rules)
- [auth.ts](file://auth.ts)
- [auth.config.ts](file://auth.config.ts)
- [modules/documents/services/folder-services.ts](file://src/modules/documents/services/folder-services.ts)

### Migration Procedures
- Versioned Schema Changes:
  - Introduce new fields with default values; deprecate old fields gradually.
  - Use migration scripts to backfill data and update indices.
  - **Plan security rule migrations carefully to avoid access disruptions.**
  - **Implement folder hierarchy migration scripts for existing document organization.**
- Rollback Strategy:
  - Maintain backward-compatible versions until migration completes.
  - Preserve old collections temporarily during transition periods.
  - **Test enhanced security rules thoroughly before deployment.**
  - **Validate folder hierarchy integrity after rollback operations.**
- Testing:
  - Validate migrations against staging environments.
  - Ensure index creation does not block deployments.
  - **Perform comprehensive security testing with various user roles and access patterns.**
  - **Test folder hierarchy operations including nested folder creation and document association.**

### Backup Strategies
- Automated Backups:
  - Schedule regular exports to cloud storage (e.g., GCS).
  - Use Firestore-native export/import features for point-in-time snapshots.
- Restore Procedures:
  - Test restore processes regularly to ensure data recoverability.
  - Document rollback steps and verify integrity post-restore.
  - **Include security rule configurations in backup and restore procedures.**
  - **Preserve folder hierarchy relationships during backup and restore operations.**

### Data Integrity Measures
- Validation Layers:
  - API route-level input validation.
  - Service-layer schema enforcement.
  - **Enhanced Firestore rules for runtime authorization and comprehensive shape checks.**
  - **Folder hierarchy validation including parent-child relationship integrity.**
- Transactions and Bulk Operations:
  - Use transactions for atomic multi-document updates.
  - Employ batched writes for efficient bulk operations.
  - **Implement transactional security policy updates when modifying access controls.**
  - **Maintain folder hierarchy consistency during bulk folder operations.**
- **Folder-Specific Integrity Measures**:
  - **Circular reference detection and prevention in folder relationships.**
  - **Depth limit enforcement to prevent excessively nested hierarchies.**
  - **Path uniqueness validation within folder scopes.**
  - **Orphaned document cleanup when folders are deleted.**
