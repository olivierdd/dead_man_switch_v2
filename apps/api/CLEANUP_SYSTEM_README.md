# Verification Token Cleanup System

## Overview

The Verification Token Cleanup System is a comprehensive solution for automatically managing and cleaning up expired verification tokens in the Secret Safe platform. It provides both automated scheduled cleanup and manual administrative control.

## Features

### 🔄 **Automated Cleanup**
- **Hourly Cleanup**: Runs every hour to remove expired tokens
- **Daily Cleanup**: Comprehensive cleanup daily at 2 AM UTC
- **Weekly Reports**: Generates detailed cleanup reports every Sunday at 3 AM UTC

### 🛠️ **Manual Control**
- **Admin Endpoints**: RESTful API for manual cleanup operations
- **Dry Run Mode**: Test cleanup operations without deleting data
- **Selective Cleanup**: Clean up specific token types
- **Batch Processing**: Configurable batch sizes for performance

### 📊 **Monitoring & Reporting**
- **Real-time Statistics**: Current token counts and cleanup recommendations
- **Performance Metrics**: Cleanup duration and tokens per second
- **Health Checks**: System health status and alerts
- **Email Notifications**: Automated alerts for significant operations

### 🔒 **Security & Safety**
- **Admin-only Access**: All cleanup operations require admin privileges
- **Audit Logging**: Comprehensive logging of all cleanup operations
- **Error Handling**: Graceful error handling with detailed reporting
- **Transaction Safety**: Batch processing with rollback on errors

## Architecture

### **Components**

1. **TokenCleanupService**: Core business logic for cleanup operations
2. **Celery Tasks**: Background task processing and scheduling
3. **Admin API Endpoints**: RESTful interface for manual operations
4. **Email Notifications**: Automated reporting and alerting
5. **Monitoring & Logging**: Performance tracking and audit trails

### **Data Flow**

```
Scheduled Tasks → Celery Workers → TokenCleanupService → Database
                                    ↓
                              Email Notifications
                                    ↓
                              Admin Dashboard
```

## Configuration

### **Environment Variables**

```bash
# Redis Configuration (Required for Celery)
REDIS_URL=redis://localhost:6379

# Email Configuration (Required for notifications)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yoursecretissafe.com

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### **Celery Configuration**

The system uses Celery for background task processing with the following queues:

- **verification**: Token cleanup operations
- **email**: Email notifications and reports
- **default**: General background tasks

## Usage

### **Starting the System**

1. **Start Redis Server**:
   ```bash
   redis-server
   ```

2. **Start Celery Beat Scheduler**:
   ```bash
   cd apps/api
   python start_celery.py beat
   ```

3. **Start Celery Workers**:
   ```bash
   # Terminal 1: Verification queue worker
   python start_celery.py worker --queue verification --concurrency 2
   
   # Terminal 2: Email queue worker
   python start_celery.py worker --queue email --concurrency 1
   
   # Terminal 3: Default queue worker
   python start_celery.py worker --queue default --concurrency 2
   ```

4. **Start FastAPI Application**:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### **Admin API Endpoints**

#### **Get Cleanup Statistics**
```http
GET /api/admin/cleanup/statistics?days=30
Authorization: Bearer <admin_token>
```

#### **Manual Cleanup**
```http
POST /api/admin/cleanup/expired-tokens
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "token_types": ["email_verification"],
  "batch_size": 1000,
  "dry_run": false
}
```

#### **Check Task Status**
```http
GET /api/admin/cleanup/task-status/{task_id}
Authorization: Bearer <admin_token>
```

#### **Generate Report**
```http
POST /api/admin/cleanup/generate-report?report_type=weekly
Authorization: Bearer <admin_token>
```

#### **System Health Check**
```http
POST /api/admin/cleanup/health-check
Authorization: Bearer <admin_token>
```

#### **View Scheduled Tasks**
```http
GET /api/admin/cleanup/scheduled-tasks
Authorization: Bearer <admin_token>
```

### **Programmatic Usage**

#### **Using TokenCleanupService**

```python
from app.tasks.verification_cleanup import TokenCleanupService
from app.database import get_db

# Get database session
db = next(get_db())

# Create cleanup service
cleanup_service = TokenCleanupService(db)

# Clean up expired tokens
result = await cleanup_service.cleanup_expired_tokens(
    token_types=[TokenType.EMAIL_VERIFICATION],
    batch_size=1000,
    dry_run=False
)

print(f"Cleaned {result['total_cleaned']} expired tokens")
```

#### **Using Celery Tasks**

```python
from app.tasks.verification_cleanup import (
    manual_cleanup_expired_tokens,
    generate_cleanup_report
)

# Start manual cleanup
task = manual_cleanup_expired_tokens.delay(
    token_types=["email_verification"],
    batch_size=1000,
    dry_run=True,
    user_id="admin-user-id"
)

# Check task status
print(f"Task ID: {task.id}")
print(f"Status: {task.status}")
```

## Monitoring

### **Celery Flower Dashboard**

Start Flower monitoring interface:
```bash
python start_celery.py flower --port 5555
```

Access at: http://localhost:5555

### **Logging**

The system uses structured logging with the following log levels:

- **INFO**: Normal operations and successful cleanups
- **WARNING**: Non-critical issues (e.g., template rendering failures)
- **ERROR**: Cleanup failures and system errors
- **DEBUG**: Detailed debugging information

### **Metrics**

Key performance metrics tracked:

- **Total tokens processed**: Number of tokens in each cleanup operation
- **Cleanup duration**: Time taken for cleanup operations
- **Tokens per second**: Processing performance
- **Error rates**: Frequency of cleanup failures
- **Batch performance**: Processing efficiency by batch size

## Troubleshooting

### **Common Issues**

#### **Redis Connection Errors**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

#### **Celery Worker Issues**
```bash
# Check worker status
celery -A app.celery_app status

# Restart workers
pkill -f "celery worker"
```

#### **Database Connection Issues**
```bash
# Check database connectivity
python -c "from app.database import get_db; print('DB OK')"

# Verify environment variables
echo $DATABASE_URL
```

### **Performance Tuning**

#### **Batch Size Optimization**
- **Small databases (< 10k tokens)**: batch_size = 500
- **Medium databases (10k-100k tokens)**: batch_size = 1000
- **Large databases (> 100k tokens)**: batch_size = 2000

#### **Worker Concurrency**
- **Development**: concurrency = 1-2
- **Production**: concurrency = 4-8 (based on CPU cores)

#### **Cleanup Frequency**
- **Low volume**: Hourly cleanup sufficient
- **High volume**: Consider 30-minute intervals
- **Critical systems**: Real-time cleanup with webhooks

## Security Considerations

### **Access Control**
- All cleanup operations require admin authentication
- JWT token validation for all endpoints
- Role-based access control (admin role required)

### **Data Protection**
- Dry run mode for testing without data loss
- Transaction rollback on errors
- Comprehensive audit logging
- No sensitive data in logs

### **Rate Limiting**
- API rate limiting on cleanup endpoints
- Celery task rate limiting
- Database query optimization

## Testing

### **Running Tests**

```bash
# Run all cleanup tests
pytest tests/test_verification_cleanup.py -v

# Run specific test class
pytest tests/test_verification_cleanup.py::TestTokenCleanupService -v

# Run with coverage
pytest tests/test_verification_cleanup.py --cov=app.tasks.verification_cleanup
```

### **Test Coverage**

The test suite covers:

- ✅ TokenCleanupService functionality
- ✅ Celery task execution
- ✅ Admin endpoint security
- ✅ Error handling and edge cases
- ✅ Performance metrics
- ✅ Database operations

## Deployment

### **Production Checklist**

- [ ] Redis server configured and secured
- [ ] Environment variables set for production
- [ ] Celery workers configured with appropriate concurrency
- [ ] Monitoring and alerting configured
- [ ] Database indexes optimized for cleanup queries
- [ ] Backup procedures in place
- [ ] Log rotation configured
- [ ] Health checks implemented

### **Scaling Considerations**

- **Horizontal scaling**: Multiple Celery workers across servers
- **Queue partitioning**: Separate queues for different token types
- **Database sharding**: Distribute tokens across multiple databases
- **Load balancing**: Distribute cleanup load across workers

## Support

### **Getting Help**

1. **Check logs**: Review application and Celery logs for errors
2. **Verify configuration**: Ensure all environment variables are set
3. **Test connectivity**: Verify Redis and database connections
4. **Review metrics**: Check Celery Flower dashboard for task status

### **Reporting Issues**

When reporting issues, include:

- Error messages and stack traces
- System configuration details
- Steps to reproduce the issue
- Log files and metrics
- Environment information (OS, Python version, etc.)

## Future Enhancements

### **Planned Features**

- **Webhook notifications**: Real-time cleanup status updates
- **Advanced scheduling**: Custom cleanup schedules per token type
- **Performance analytics**: Historical performance trends
- **Machine learning**: Predictive cleanup scheduling
- **Multi-tenant support**: Organization-specific cleanup policies

### **Contributing**

To contribute to the cleanup system:

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure all tests pass

---

**Note**: This system is designed for production use and includes comprehensive error handling, monitoring, and security features. Always test cleanup operations in a development environment before running in production.
