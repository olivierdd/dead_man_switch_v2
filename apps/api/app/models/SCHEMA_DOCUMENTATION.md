# Secret Safe Database Schema Documentation

## Overview

The Secret Safe application uses SQLModel (which combines SQLAlchemy and Pydantic) to provide a comprehensive database schema for a digital dead man's switch service. The schema is designed with security, scalability, and audit capabilities in mind.

## Database Architecture

### Core Principles
- **Role-Based Access Control (RBAC)**: Admin, Writer, Reader roles with granular permissions
- **Audit Trail**: Comprehensive logging of all user actions and system events
- **Security First**: Encrypted content, password protection, and access controls
- **Scalability**: Proper indexing and relationship design for performance
- **Compliance**: GDPR-ready with data retention and deletion policies

## Database Models

### 1. User Management Models

#### User (Core User Entity)
The central user entity with comprehensive profile and security features.

**Key Fields:**
- `id`: UUID primary key
- `email`: Unique email address (indexed)
- `role`: UserRole enum (ADMIN, WRITER, READER)
- `subscription_tier`: SubscriptionTier enum (FREE, BASIC, PREMIUM, ULTIMATE)
- `check_in_interval`: Days between required check-ins
- `grace_period`: Additional days after check-in deadline

**Security Features:**
- `password_hash`: Bcrypt-hashed password
- `two_factor_enabled`: 2FA support
- `failed_login_attempts`: Account lockout protection
- `locked_until`: Temporary account suspension

**Audit Fields:**
- `created_at`, `updated_at`: Timestamp tracking
- `last_check_in`, `last_activity_at`: Activity monitoring
- `created_by`, `role_changed_by`: Change attribution

**Relationships:**
- `messages`: One-to-many with Message
- `shared_messages`: One-to-many with MessageShare
- `check_ins`: One-to-many with CheckIn
- `role_changes`: One-to-many with RoleChangeLog
- `permissions`: One-to-many with UserPermission

#### UserProfile
Public-facing user information for display purposes.

#### UserCreate/UserUpdate
Pydantic models for API operations with validation.

#### RoleChangeLog
Audit trail for role modifications with reason tracking.

#### UserPermission
Granular permissions system for fine-grained access control.

#### CheckIn
User check-in records with device and location information.

#### UserAuditLog
Comprehensive audit logging for all user actions.

#### UserSession
Session management for authentication and security.

### 2. Message Management Models

#### Message (Core Message Entity)
The central message entity implementing the dead man's switch functionality.

**Key Fields:**
- `id`: UUID primary key
- `user_id`: Foreign key to User
- `encrypted_content`: AES-256 encrypted message content
- `encrypted_key`: Encrypted AES key
- `content_hash`: SHA-256 hash for integrity verification
- `status`: MessageStatus enum (DRAFT, ACTIVE, DELIVERED, etc.)

**Check-in Configuration:**
- `check_in_interval`: Days between required check-ins
- `grace_period`: Additional grace period days
- `last_check_in`: Timestamp of last check-in
- `next_check_in_deadline`: Calculated next deadline

**Security Features:**
- `requires_password`: Optional password protection
- `max_access_attempts`: Brute force protection
- `encryption_algorithm`: Encryption method specification

**Blockchain Integration (Ultimate Tier):**
- `ipfs_hash`: IPFS content hash
- `arweave_hash`: Arweave permanent storage hash
- `blockchain_registry_id`: Smart contract reference
- `has_decentralized_backup`: Backup status flag

**Dissolution Planning:**
- `dissolution_action`: Action type when check-in fails
- `backup_owner_email`: Alternative contact
- `extended_grace_period`: Extended deadline option

**Analytics:**
- `view_count`: Message access tracking
- `delivery_success_rate`: Recipient delivery success
- `has_attachments`: Attachment presence flag

**Relationships:**
- `user`: Many-to-one with User
- `shared_with_readers`: One-to-many with MessageShare
- `recipients`: One-to-many with Recipient

#### MessageShare
Tracks messages shared with Reader users with granular permissions.

**Key Features:**
- Granular permissions (view, download, share, comment)
- Approval workflow support
- Expiration dates
- Access tracking and analytics

#### Recipient
Message delivery recipients with delivery preferences and tracking.

**Key Features:**
- Multiple delivery methods (email, SMS, webhook)
- Delivery status tracking
- Retry logic with failure handling
- Confirmation requirements
- Analytics (open count, click count)

#### DissolutionPlan
Company dissolution contingency planning for business users.

**Key Features:**
- Company information tracking
- Legal document references
- Emergency contact management
- Execution status tracking

#### MessageAttachment
File attachments with security and access controls.

**Key Features:**
- File encryption support
- Access control and download limits
- Multiple storage providers
- File integrity verification

#### MessageAuditLog
Comprehensive audit logging for message operations.

### 3. Enums and Constants

#### UserRole
- `ADMIN`: Full system access and user management
- `WRITER`: Create and manage messages
- `READER`: View shared messages only

#### MessageStatus
- `DRAFT`: Message creation in progress
- `ACTIVE`: Active dead man's switch
- `DELIVERED`: Message has been delivered
- `CANCELLED`: Message cancelled by user
- `EXPIRED`: Message expired naturally
- `SCHEDULED`: Scheduled for future activation
- `PAUSED`: Temporarily paused

#### MessagePriority
- `LOW`: Low priority messages
- `NORMAL`: Standard priority
- `HIGH`: High priority
- `URGENT`: Urgent delivery
- `CRITICAL`: Critical messages

#### MessageType
- `PERSONAL`: Personal messages
- `BUSINESS`: Business communications
- `LEGAL`: Legal documents
- `FINANCIAL`: Financial information
- `MEDICAL`: Medical records
- `TECHNICAL`: Technical documentation
- `EMERGENCY`: Emergency information

#### SubscriptionTier
- `FREE`: Basic functionality
- `BASIC`: Enhanced features
- `PREMIUM`: Advanced capabilities
- `ULTIMATE`: Blockchain and IPFS features

## Database Design Patterns

### 1. Indexing Strategy
- **Primary Keys**: UUID with auto-generation
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Text fields with full-text search support
- **Status Fields**: Boolean and enum fields for filtering
- **Timestamp Fields**: Date/time fields for range queries
- **Composite Indexes**: Multi-field indexes for common queries

### 2. Relationship Design
- **Lazy Loading**: Using `sa_relationship_kwargs={"lazy": "selectin"}` for performance
- **Forward References**: Avoiding circular imports with TYPE_CHECKING
- **Bidirectional**: Proper back_populates for relationship management
- **Cascade**: Appropriate cascade settings for data integrity

### 3. Security Patterns
- **Encryption**: AES-256 for content, bcrypt for passwords
- **Hashing**: SHA-256 for integrity verification
- **Access Control**: Role-based and permission-based systems
- **Audit Logging**: Comprehensive action tracking
- **Session Management**: Secure token handling

### 4. Performance Optimizations
- **Connection Pooling**: Database connection management
- **Query Optimization**: Proper indexing and relationship design
- **Lazy Loading**: On-demand data fetching
- **Batch Operations**: Efficient bulk operations
- **Caching**: Redis integration for frequently accessed data

## Database Operations

### 1. Initialization
```python
from app.models.database import init_db, DatabaseUtils

# Create all tables
init_db()

# Get database information
table_info = DatabaseUtils.get_table_info()
```

### 2. Health Checks
```python
from app.models.database import check_database_health

# Check database status
health = check_database_health()
```

### 3. Migrations
```python
from app.models.database import DatabaseMigrations

# Record schema changes
DatabaseMigrations.record_migration("1.0.0", "Initial schema")
```

## Best Practices

### 1. Model Usage
- Always use Pydantic models for API input/output
- Use SQLModel for database operations
- Implement proper validation with Pydantic validators
- Use enums for constrained values

### 2. Security
- Never store plain text passwords
- Always encrypt sensitive content
- Implement proper access controls
- Log all security-relevant actions

### 3. Performance
- Use appropriate indexes for query patterns
- Implement lazy loading for relationships
- Use connection pooling
- Monitor query performance

### 4. Maintenance
- Regular database health checks
- Monitor table sizes and growth
- Implement data retention policies
- Regular backup and recovery testing

## Future Enhancements

### 1. Advanced Features
- Full-text search capabilities
- GraphQL support
- Real-time notifications
- Advanced analytics

### 2. Scalability
- Database sharding
- Read replicas
- Horizontal scaling
- Microservices architecture

### 3. Compliance
- GDPR compliance tools
- Data retention policies
- Privacy controls
- Audit reporting

## Conclusion

The Secret Safe database schema provides a robust foundation for a secure, scalable, and compliant digital dead man's switch service. The design emphasizes security, audit capabilities, and performance while maintaining flexibility for future enhancements.

The schema supports the full range of features outlined in the PRD, from basic message management to advanced blockchain integration, all while maintaining proper security and compliance standards.
