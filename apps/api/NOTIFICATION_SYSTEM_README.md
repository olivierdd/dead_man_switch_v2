# Notification System Documentation

## Overview

The Secret Safe notification system provides comprehensive user notification capabilities including verification success/failure notifications, reminders, and user preference management. The system supports multiple delivery channels (email, in-app) and provides detailed tracking and analytics.

## Features

### Core Notification Types
- **Verification Success**: Sent when users successfully verify their email/account
- **Verification Failure**: Sent when verification attempts fail with retry guidance
- **Verification Reminder**: Periodic reminders for unverified users
- **System Alerts**: Important system notifications
- **Security Alerts**: Security-related notifications
- **User Activity**: User activity notifications

### Delivery Channels
- **Email**: Professional HTML and plain text email templates
- **In-App**: Real-time in-application notifications
- **Both**: Multi-channel delivery for important notifications

### User Preferences
- **Channel Selection**: Choose email, in-app, or both
- **Type Filtering**: Enable/disable specific notification types
- **Frequency Control**: Set reminder frequencies (daily, weekly, monthly)
- **Quiet Hours**: Configure time periods for reduced notifications

## Architecture

### Components

```
NotificationService
├── Email Delivery
├── Database Storage
├── User Preferences
└── Analytics & Tracking

Notification Routes
├── User Notifications
├── Preferences Management
├── Statistics & Analytics
└── Interaction Tracking

Database Models
├── Notification
├── NotificationPreferences
└── NotificationStatistics
```

### Data Flow

1. **Event Trigger**: Verification success/failure, system events
2. **Notification Creation**: Service creates notification record
3. **Delivery Processing**: Email sent, in-app notification queued
4. **User Interaction**: Click tracking, read status updates
5. **Analytics**: Statistics collection and reporting

## Setup & Configuration

### Environment Variables

```bash
# Email Configuration
SENDGRID_API_KEY=your_sendgrid_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

# Frontend URL for email links
FRONTEND_URL=https://app.yoursecretissafe.com

# Notification Settings
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_QUIET_HOURS_START=22:00
NOTIFICATION_QUIET_HOURS_END=08:00
```

### Database Setup

The notification system requires the following database tables:

```sql
-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    channel VARCHAR(20) DEFAULT 'both',
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    delivery_attempts INTEGER DEFAULT 0,
    last_delivery_attempt TIMESTAMP WITH TIME ZONE,
    delivery_error TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    email_enabled BOOLEAN DEFAULT TRUE,
    email_verification_success BOOLEAN DEFAULT TRUE,
    email_verification_failure BOOLEAN DEFAULT TRUE,
    email_verification_reminder BOOLEAN DEFAULT TRUE,
    email_security_alerts BOOLEAN DEFAULT TRUE,
    email_system_notifications BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    in_app_verification_success BOOLEAN DEFAULT TRUE,
    in_app_verification_failure BOOLEAN DEFAULT TRUE,
    in_app_verification_reminder BOOLEAN DEFAULT TRUE,
    in_app_security_alerts BOOLEAN DEFAULT TRUE,
    in_app_system_notifications BOOLEAN DEFAULT TRUE,
    reminder_frequency VARCHAR(20) DEFAULT 'daily',
    quiet_hours_start VARCHAR(5) DEFAULT '22:00',
    quiet_hours_end VARCHAR(5) DEFAULT '08:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

## Usage

### Basic Notification Service Usage

```python
from app.services.notification_service import NotificationService

# Initialize service
notification_service = NotificationService()

# Send verification success notification
await notification_service.send_verification_success_notification(
    user_id=user.id,
    verification_type="email",
    additional_data={"verification_method": "email"}
)

# Send verification failure notification
await notification_service.send_verification_failure_notification(
    user_id=user.id,
    failure_reason="Token expired",
    verification_type="email",
    retry_available=True
)

# Send verification reminder
await notification_service.send_verification_reminder_notification(
    user_id=user.id,
    verification_type="email",
    days_since_registration=5
)
```

### API Endpoints

#### Get User Notifications
```http
GET /api/notifications/?limit=50&offset=0&unread_only=false
Authorization: Bearer <jwt_token>
```

#### Get Notification Statistics
```http
GET /api/notifications/statistics
Authorization: Bearer <jwt_token>
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "email_enabled": true,
    "in_app_enabled": true,
    "reminder_frequency": "weekly"
}
```

#### Mark Notification as Read
```http
POST /api/notifications/{notification_id}/read
Authorization: Bearer <jwt_token>
```

#### Mark All Notifications as Read
```http
POST /api/notifications/mark-all-read
Authorization: Bearer <jwt_token>
```

### Frontend Integration

#### React Hook for Notifications
```typescript
import { useNotifications } from '@/hooks/use-notifications';

function NotificationCenter() {
    const { notifications, markAsRead, preferences, updatePreferences } = useNotifications();
    
    return (
        <div>
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead(notification.id)}
                />
            ))}
        </div>
    );
}
```

#### Notification Preferences Component
```typescript
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';

function NotificationPreferences() {
    const { preferences, updatePreferences, loading } = useNotificationPreferences();
    
    const handleToggle = (key: string, value: boolean) => {
        updatePreferences({ [key]: value });
    };
    
    return (
        <div>
            <h3>Email Notifications</h3>
            <Toggle
                label="Verification Success"
                checked={preferences.email_verification_success}
                onChange={(checked) => handleToggle('email_verification_success', checked)}
            />
            {/* More toggles... */}
        </div>
    );
}
```

## Email Templates

### Verification Success Template
- **Subject**: 🎉 Verification Successful - Welcome to Secret Safe!
- **Content**: Welcome message, feature highlights, dashboard link
- **Design**: Professional gradient header, success icon, call-to-action button

### Verification Failure Template
- **Subject**: ⚠️ Verification Failed - Action Required
- **Content**: Error details, troubleshooting steps, retry options
- **Design**: Warning color scheme, error box, helpful guidance

### Verification Reminder Template
- **Subject**: 🔔 Complete Your Verification - Secret Safe
- **Content**: Reminder message, benefits of verification, action button
- **Design**: Blue gradient header, reminder icon, highlight box

## Testing

### Running Tests
```bash
# Run all notification tests
pytest tests/test_notification_system.py -v

# Run specific test class
pytest tests/test_notification_system.py::TestNotificationService -v

# Run with coverage
pytest tests/test_notification_system.py --cov=app.services.notification_service --cov-report=html
```

### Test Coverage
- **Service Layer**: Notification creation, delivery, management
- **API Layer**: Route endpoints, authentication, validation
- **Integration**: Email service integration, database operations
- **Error Handling**: Database failures, email service errors
- **Edge Cases**: Invalid data, missing users, expired tokens

## Monitoring & Analytics

### Key Metrics
- **Delivery Success Rate**: Percentage of successful notifications
- **User Engagement**: Click-through rates, read rates
- **Channel Performance**: Email vs in-app effectiveness
- **User Preferences**: Most/least popular notification types

### Health Checks
```http
GET /api/notifications/health
```

Response includes:
- Email service status
- Database connection health
- Notification queue status
- Recent error rates

## Troubleshooting

### Common Issues

#### Email Delivery Failures
```bash
# Check email service logs
tail -f logs/email_service.log

# Verify environment variables
echo $SENDGRID_API_KEY
echo $AWS_ACCESS_KEY_ID

# Test email service connection
python -c "from app.services.email_service import email_service; print(email_service.get_provider_status())"
```

#### Database Connection Issues
```bash
# Check database connection
python -c "from app.models.database import get_db; print('Database connection OK')"

# Verify table existence
psql -d your_database -c "\dt notifications*"
```

#### Notification Not Appearing
1. Check user notification preferences
2. Verify notification was created in database
3. Check email service logs for delivery errors
4. Verify user email address is correct

### Debug Mode
Enable debug logging for detailed troubleshooting:

```python
import logging
logging.getLogger('app.services.notification_service').setLevel(logging.DEBUG)
logging.getLogger('app.services.email_service').setLevel(logging.DEBUG)
```

## Performance Optimization

### Database Optimization
- **Batch Operations**: Process notifications in batches
- **Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Minimize N+1 queries

### Email Delivery Optimization
- **Async Processing**: Non-blocking email delivery
- **Rate Limiting**: Respect email provider limits
- **Retry Logic**: Exponential backoff for failed deliveries
- **Queue Management**: Prioritize important notifications

### Caching Strategy
- **User Preferences**: Cache user notification preferences
- **Notification Counts**: Cache unread notification counts
- **Template Caching**: Cache rendered email templates

## Security Considerations

### Data Protection
- **User Privacy**: Only send notifications to authenticated users
- **Data Minimization**: Store only necessary notification data
- **Access Control**: Verify user ownership before operations
- **Audit Logging**: Track all notification operations

### Email Security
- **Sender Verification**: Verify sender email addresses
- **Content Validation**: Sanitize notification content
- **Rate Limiting**: Prevent notification spam
- **Unsubscribe Support**: Respect user preferences

## Future Enhancements

### Planned Features
- **Push Notifications**: Mobile push notification support
- **SMS Integration**: Text message notifications
- **Advanced Scheduling**: Timezone-aware delivery scheduling
- **A/B Testing**: Test different notification content
- **Machine Learning**: Smart notification timing and content

### Integration Opportunities
- **Slack Integration**: Team notification channels
- **Webhook Support**: External system notifications
- **Analytics Dashboard**: Advanced reporting interface
- **User Segmentation**: Targeted notification campaigns

## Support & Maintenance

### Regular Maintenance
- **Database Cleanup**: Remove old notifications (configurable retention)
- **Performance Monitoring**: Track response times and throughput
- **Error Rate Monitoring**: Monitor and alert on high error rates
- **User Feedback**: Collect and analyze user satisfaction

### Support Channels
- **Documentation**: This README and API documentation
- **Logs**: Application and service logs
- **Monitoring**: Health check endpoints and metrics
- **Development Team**: Direct support for critical issues

## Conclusion

The Secret Safe notification system provides a robust, scalable foundation for user communication. With comprehensive features, flexible configuration, and strong monitoring capabilities, it ensures users stay informed and engaged while maintaining system performance and reliability.

For additional support or feature requests, please contact the development team or refer to the project documentation.
