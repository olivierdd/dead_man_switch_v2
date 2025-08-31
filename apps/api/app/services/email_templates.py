"""
Email Templates for Secret Safe Platform

Professional email templates for verification, password reset, and other notifications.
Uses Jinja2 templating for dynamic content and responsive design.
"""

from jinja2 import Template
from typing import Dict, Any, Optional
import os


class EmailTemplateManager:
    """Manages email templates with Jinja2 rendering."""

    def __init__(self):
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict[str, Template]]:
        """Load all email templates."""
        return {
            "email_verification": {
                "html": self._get_verification_html_template(),
                "text": self._get_verification_text_template()
            },
            "password_reset": {
                "html": self._get_password_reset_html_template(),
                "text": self._get_password_reset_text_template()
            },
            "welcome": {
                "html": self._get_welcome_html_template(),
                "text": self._get_welcome_text_template()
            },
            "email_change": {
                "html": self._get_email_change_html_template(),
                "text": self._get_email_change_text_template()
            },
            # Cleanup notification templates
            "cleanup_notification": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Token Cleanup Notification</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                        .stat-label { font-weight: bold; color: #64748b; }
                        .stat-value { font-weight: bold; color: #1e293b; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                        .priority-high { color: #dc2626; font-weight: bold; }
                        .priority-medium { color: #d97706; font-weight: bold; }
                        .priority-low { color: #059669; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔧 Token Cleanup Notification</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <h2>Cleanup Operation Completed</h2>
                            <p>A token cleanup operation has been completed on the Secret Safe platform.</p>
                            
                            <div class="stats-box">
                                <h3>📊 Cleanup Statistics</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Operation Type:</span>
                                    <span class="stat-value">{{ notification_type.replace('_', ' ').title() }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Expired:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_expired }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Cleaned:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_cleaned }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Batches Processed:</span>
                                    <span class="stat-value">{{ cleanup_stats.batches_processed }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Duration:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Performance:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second</span>
                                </div>
                            </div>
                            
                            {% if cleanup_stats.errors %}
                            <div class="stats-box" style="border-left: 4px solid #dc2626;">
                                <h3>⚠️ Errors Encountered</h3>
                                <p>{{ cleanup_stats.errors|length }} error(s) occurred during cleanup:</p>
                                <ul>
                                    {% for error in cleanup_stats.errors %}
                                    <li>{{ error }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            {% endif %}
                            
                            <div class="stats-box">
                                <h3>📅 Operation Details</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Started:</span>
                                    <span class="stat-value">{{ cleanup_stats.started_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Completed:</span>
                                    <span class="stat-value">{{ cleanup_stats.completed_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Task ID:</span>
                                    <span class="stat-value">{{ task_id }}</span>
                                </div>
                            </div>
                            
                            <p><strong>Note:</strong> This is an automated notification. No action is required unless errors were encountered.</p>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - Automated Cleanup Notification</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                TOKEN CLEANUP NOTIFICATION
                ===========================
                
                Secret Safe Platform
                
                A token cleanup operation has been completed.
                
                CLEANUP STATISTICS:
                - Operation Type: {{ notification_type.replace('_', ' ').title() }}
                - Total Expired: {{ cleanup_stats.total_expired }}
                - Total Cleaned: {{ cleanup_stats.total_cleaned }}
                - Batches Processed: {{ cleanup_stats.batches_processed }}
                - Duration: {{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds
                - Performance: {{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second
                
                {% if cleanup_stats.errors %}
                ERRORS ENCOUNTERED:
                {{ cleanup_stats.errors|length }} error(s) occurred during cleanup:
                {% for error in cleanup_stats.errors %}
                - {{ error }}
                {% endfor %}
                {% endif %}
                
                OPERATION DETAILS:
                - Started: {{ cleanup_stats.started_at }}
                - Completed: {{ cleanup_stats.completed_at }}
                - Task ID: {{ task_id }}
                
                Note: This is an automated notification. No action is required unless errors were encountered.
                
                ---
                Secret Safe Platform - Automated Cleanup Notification
                Generated at {{ timestamp }}
                """
            },
            
            "daily_cleanup_report": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Daily Token Cleanup Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                        .stat-label { font-weight: bold; color: #64748b; }
                        .stat-value { font-weight: bold; color: #1e293b; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                        .success { color: #059669; font-weight: bold; }
                        .warning { color: #d97706; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📅 Daily Token Cleanup Report</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <h2>Daily Maintenance Completed</h2>
                            <p>The daily token cleanup operation has been completed successfully.</p>
                            
                            <div class="stats-box">
                                <h3>📊 Daily Cleanup Summary</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Operation Type:</span>
                                    <span class="stat-value">Daily Comprehensive Cleanup</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Expired:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_expired }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Cleaned:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_cleaned }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Batches Processed:</span>
                                    <span class="stat-value">{{ cleanup_stats.batches_processed }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Duration:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Performance:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second</span>
                                </div>
                            </div>
                            
                            {% if cleanup_stats.errors %}
                            <div class="stats-box" style="border-left: 4px solid #dc2626;">
                                <h3>⚠️ Issues Encountered</h3>
                                <p>{{ cleanup_stats.errors|length }} error(s) occurred during cleanup:</p>
                                <ul>
                                    {% for error in cleanup_stats.errors %}
                                    <li>{{ error }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            {% endif %}
                            
                            <div class="stats-box">
                                <h3>📅 Operation Details</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Started:</span>
                                    <span class="stat-value">{{ cleanup_stats.started_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Completed:</span>
                                    <span class="stat-value">{{ cleanup_stats.completed_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Task ID:</span>
                                    <span class="stat-value">{{ task_id }}</span>
                                </div>
                            </div>
                            
                            <div class="stats-box">
                                <h3>💡 System Health</h3>
                                <p>The daily cleanup operation helps maintain optimal system performance by removing expired tokens that are no longer needed.</p>
                                <p><strong>Status:</strong> <span class="success">✅ Daily maintenance completed successfully</span></p>
                            </div>
                            
                            <p><strong>Next scheduled cleanup:</strong> Tomorrow at 2:00 AM UTC</p>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - Daily Cleanup Report</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                DAILY TOKEN CLEANUP REPORT
                ===========================
                
                Secret Safe Platform
                
                The daily token cleanup operation has been completed successfully.
                
                DAILY CLEANUP SUMMARY:
                - Operation Type: Daily Comprehensive Cleanup
                - Total Expired: {{ cleanup_stats.total_expired }}
                - Total Cleaned: {{ cleanup_stats.total_cleaned }}
                - Batches Processed: {{ cleanup_stats.batches_processed }}
                - Duration: {{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds
                - Performance: {{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second
                
                {% if cleanup_stats.errors %}
                ISSUES ENCOUNTERED:
                {{ cleanup_stats.errors|length }} error(s) occurred during cleanup:
                {% for error in cleanup_stats.errors %}
                - {{ error }}
                {% endfor %}
                {% endif %}
                
                OPERATION DETAILS:
                - Started: {{ cleanup_stats.started_at }}
                - Completed: {{ cleanup_stats.completed_at }}
                - Task ID: {{ task_id }}
                
                SYSTEM HEALTH:
                The daily cleanup operation helps maintain optimal system performance by removing expired tokens that are no longer needed.
                Status: ✅ Daily maintenance completed successfully
                
                Next scheduled cleanup: Tomorrow at 2:00 AM UTC
                
                ---
                Secret Safe Platform - Daily Cleanup Report
                Generated at {{ timestamp }}
                """
            },
            
            "weekly_cleanup_report": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Weekly Token Cleanup Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                        .stat-label { font-weight: bold; color: #64748b; }
                        .stat-value { font-weight: bold; color: #1e293b; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                        .period-box { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 15px 0; }
                        .recommendation { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📊 Weekly Token Cleanup Report</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <h2>Weekly System Analysis</h2>
                            <p>Weekly token cleanup analysis and recommendations for the Secret Safe platform.</p>
                            
                            <div class="stats-box">
                                <h3>📈 Weekly Overview</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Report Type:</span>
                                    <span class="stat-value">{{ cleanup_stats.report_type.title() }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Generated:</span>
                                    <span class="stat-value">{{ cleanup_stats.generated_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Analysis Periods:</span>
                                    <span class="stat-value">{{ cleanup_stats.periods|length }} time periods</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Recommendations:</span>
                                    <span class="stat-value">{{ cleanup_stats.recommendations|length }} items</span>
                                </div>
                            </div>
                            
                            {% for period_name, period_data in cleanup_stats.periods.items() %}
                            <div class="period-box">
                                <h3>📅 {{ period_name.replace('_', ' ').title() }} Analysis</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Total Tokens:</span>
                                    <span class="stat-value">{{ period_data.total_tokens }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Expired Tokens:</span>
                                    <span class="stat-value">{{ period_data.expired_tokens }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Used Tokens:</span>
                                    <span class="stat-value">{{ period_data.used_tokens }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Active Tokens:</span>
                                    <span class="stat-value">{{ period_data.active_tokens }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Expiring Soon (24h):</span>
                                    <span class="stat-value">{{ period_data.expiring_soon_24h }}</span>
                                </div>
                            </div>
                            {% endfor %}
                            
                            {% if cleanup_stats.recommendations %}
                            <div class="stats-box">
                                <h3>💡 Recommendations</h3>
                                {% for rec in cleanup_stats.recommendations %}
                                <div class="recommendation">
                                    <h4>{{ rec.type.replace('_', ' ').title() }} - {{ rec.priority.upper() }}</h4>
                                    <p><strong>{{ rec.message }}</strong></p>
                                    {% if rec.estimated_time %}
                                    <p>Estimated time: {{ "%.2f"|format(rec.estimated_time) }} seconds</p>
                                    {% endif %}
                                    {% if rec.action %}
                                    <p>Action: {{ rec.action }}</p>
                                    {% endif %}
                                </div>
                                {% endfor %}
                            </div>
                            {% endif %}
                            
                            <div class="stats-box">
                                <h3>📅 Next Actions</h3>
                                <p><strong>Next scheduled cleanup:</strong> Tomorrow at 2:00 AM UTC</p>
                                <p><strong>Next weekly report:</strong> Next Sunday at 3:00 AM UTC</p>
                                <p><strong>System health:</strong> Monitor recommendations above for any required actions</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - Weekly Cleanup Report</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                WEEKLY TOKEN CLEANUP REPORT
                ============================
                
                Secret Safe Platform
                
                Weekly token cleanup analysis and recommendations.
                
                WEEKLY OVERVIEW:
                - Report Type: {{ cleanup_stats.report_type.title() }}
                - Generated: {{ cleanup_stats.generated_at }}
                - Analysis Periods: {{ cleanup_stats.periods|length }} time periods
                - Recommendations: {{ cleanup_stats.recommendations|length }} items
                
                {% for period_name, period_data in cleanup_stats.periods.items() %}
                {{ period_name.replace('_', ' ').title() }} ANALYSIS:
                - Total Tokens: {{ period_data.total_tokens }}
                - Expired Tokens: {{ period_data.expired_tokens }}
                - Used Tokens: {{ period_data.used_tokens }}
                - Active Tokens: {{ period_data.active_tokens }}
                - Expiring Soon (24h): {{ period_data.expiring_soon_24h }}
                
                {% endfor %}
                
                {% if cleanup_stats.recommendations %}
                RECOMMENDATIONS:
                {% for rec in cleanup_stats.recommendations %}
                {{ rec.type.replace('_', ' ').title() }} - {{ rec.priority.upper() }}:
                {{ rec.message }}
                {% if rec.estimated_time %}Estimated time: {{ "%.2f"|format(rec.estimated_time) }} seconds{% endif %}
                {% if rec.action %}Action: {{ rec.action }}{% endif %}
                
                {% endfor %}
                {% endif %}
                
                NEXT ACTIONS:
                - Next scheduled cleanup: Tomorrow at 2:00 AM UTC
                - Next weekly report: Next Sunday at 3:00 AM UTC
                - System health: Monitor recommendations above for any required actions
                
                ---
                Secret Safe Platform - Weekly Cleanup Report
                Generated at {{ timestamp }}
                """
            },
            
            "manual_cleanup_report": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Manual Token Cleanup Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                        .stat-label { font-weight: bold; color: #64748b; }
                        .stat-value { font-weight: bold; color: #1e293b; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                        .manual-info { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔧 Manual Token Cleanup Report</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <h2>Manual Cleanup Operation Completed</h2>
                            <p>A manual token cleanup operation has been completed by an administrator.</p>
                            
                            <div class="manual-info">
                                <h3>👤 Manual Operation Details</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Initiated By:</span>
                                    <span class="stat-value">{{ cleanup_stats.manual_cleanup.initiated_by }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Initiated At:</span>
                                    <span class="stat-value">{{ cleanup_stats.manual_cleanup.initiated_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Task ID:</span>
                                    <span class="stat-value">{{ cleanup_stats.manual_cleanup.task_id }}</span>
                                </div>
                            </div>
                            
                            <div class="stats-box">
                                <h3>📊 Cleanup Results</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Operation Type:</span>
                                    <span class="stat-value">Manual Cleanup</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Expired:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_expired }}</span>
                                </div>
                                <div class="stat-label">Total Cleaned:</span>
                                    <span class="stat-value">{{ cleanup_stats.total_cleaned }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Batches Processed:</span>
                                    <span class="stat-value">{{ cleanup_stats.batches_processed }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Duration:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Performance:</span>
                                    <span class="stat-value">{{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second</span>
                                </div>
                            </div>
                            
                            {% if cleanup_stats.errors %}
                            <div class="stats-box" style="border-left: 4px solid #dc2626;">
                                <h3>⚠️ Errors Encountered</h3>
                                <p>{{ cleanup_stats.errors|length }} error(s) occurred during cleanup:</p>
                                <ul>
                                    {% for error in cleanup_stats.errors %}
                                    <li>{{ error }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            {% endif %}
                            
                            <div class="stats-box">
                                <h3>📅 Operation Details</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Started:</span>
                                    <span class="stat-value">{{ cleanup_stats.started_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Completed:</span>
                                    <span class="stat-value">{{ cleanup_stats.completed_at }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Task ID:</span>
                                    <span class="stat-value">{{ task_id }}</span>
                                </div>
                            </div>
                            
                            <p><strong>Note:</strong> This cleanup was manually initiated by an administrator. The system will continue to perform automatic cleanup operations as scheduled.</p>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - Manual Cleanup Report</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                MANUAL TOKEN CLEANUP REPORT
                ============================
                
                Secret Safe Platform
                
                A manual token cleanup operation has been completed by an administrator.
                
                MANUAL OPERATION DETAILS:
                - Initiated By: {{ cleanup_stats.manual_cleanup.initiated_by }}
                - Initiated At: {{ cleanup_stats.manual_cleanup.initiated_at }}
                - Task ID: {{ cleanup_stats.manual_cleanup.task_id }}
                
                CLEANUP RESULTS:
                - Operation Type: Manual Cleanup
                - Total Expired: {{ cleanup_stats.total_expired }}
                - Total Cleaned: {{ cleanup_stats.total_cleaned }}
                - Batches Processed: {{ cleanup_stats.batches_processed }}
                - Duration: {{ "%.2f"|format(cleanup_stats.total_duration_seconds) }} seconds
                - Performance: {{ "%.2f"|format(cleanup_stats.tokens_per_second) }} tokens/second
                
                {% if cleanup_stats.errors %}
                ERRORS ENCOUNTERED:
                {{ cleanup_stats.errors|length }} error(s) occurred during cleanup:
                {% for error in cleanup_stats.errors %}
                - {{ error }}
                {% endfor %}
                {% endif %}
                
                OPERATION DETAILS:
                - Started: {{ cleanup_stats.started_at }}
                - Completed: {{ cleanup_stats.completed_at }}
                - Task ID: {{ task_id }}
                
                Note: This cleanup was manually initiated by an administrator. The system will continue to perform automatic cleanup operations as scheduled.
                
                ---
                Secret Safe Platform - Manual Cleanup Report
                Generated at {{ timestamp }}
                """
            },
            
            "system_alert": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>System Alert</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .alert-box { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                        .stat-label { font-weight: bold; color: #64748b; }
                        .stat-value { font-weight: bold; color: #1e293b; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                        .priority-critical { color: #dc2626; font-weight: bold; }
                        .priority-high { color: #d97706; font-weight: bold; }
                        .priority-medium { color: #059669; font-weight: bold; }
                        .priority-low { color: #3b82f6; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚨 System Alert</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <div class="alert-box">
                                <h2>⚠️ {{ alert_type.replace('_', ' ').title() }} Alert</h2>
                                <p><strong>Priority:</strong> <span class="priority-{{ priority }}">{{ priority.upper() }}</span></p>
                                <p><strong>Message:</strong> {{ alert_message }}</p>
                            </div>
                            
                            <div class="alert-box">
                                <h3>📊 Alert Details</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Alert Type:</span>
                                    <span class="stat-value">{{ alert_type.replace('_', ' ').title() }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Priority:</span>
                                    <span class="stat-value">{{ priority.upper() }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Timestamp:</span>
                                    <span class="stat-value">{{ timestamp }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Task ID:</span>
                                    <span class="stat-value">{{ task_id }}</span>
                                </div>
                            </div>
                            
                            {% if alert_data %}
                            <div class="alert-box">
                                <h3>📋 Additional Data</h3>
                                <pre>{{ alert_data|tojson(indent=2) }}</pre>
                            </div>
                            {% endif %}
                            
                            <div class="alert-box">
                                <h3>🔍 Recommended Actions</h3>
                                {% if priority == "critical" %}
                                <p><strong>IMMEDIATE ACTION REQUIRED:</strong> This is a critical system alert that requires immediate attention.</p>
                                <ul>
                                    <li>Review the alert details above</li>
                                    <li>Check system logs for additional context</li>
                                    <li>Implement necessary fixes immediately</li>
                                    <li>Contact system administrators if needed</li>
                                </ul>
                                {% elif priority == "high" %}
                                <p><strong>HIGH PRIORITY:</strong> This alert requires prompt attention.</p>
                                <ul>
                                    <li>Review the alert details</li>
                                    <li>Investigate the root cause</li>
                                    <li>Implement fixes within the next few hours</li>
                                </ul>
                                {% elif priority == "medium" %}
                                <p><strong>MEDIUM PRIORITY:</strong> This alert should be addressed soon.</p>
                                <ul>
                                    <li>Review the alert details</li>
                                    <li>Plan appropriate fixes</li>
                                    <li>Address within the next day</li>
                                </ul>
                                {% else %}
                                <p><strong>LOW PRIORITY:</strong> This is an informational alert.</p>
                                <ul>
                                    <li>Review the alert details</li>
                                    <li>Monitor for any changes</li>
                                    <li>Address during regular maintenance</li>
                                </ul>
                                {% endif %}
                            </div>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - System Alert</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                SYSTEM ALERT
                ============
                
                Secret Safe Platform
                
                🚨 {{ alert_type.replace('_', ' ').title() }} Alert
                
                Priority: {{ priority.upper() }}
                Message: {{ alert_message }}
                
                ALERT DETAILS:
                - Alert Type: {{ alert_type.replace('_', ' ').title() }}
                - Priority: {{ priority.upper() }}
                - Timestamp: {{ timestamp }}
                - Task ID: {{ task_id }}
                
                {% if alert_data %}
                ADDITIONAL DATA:
                {{ alert_data|tojson(indent=2) }}
                {% endif %}
                
                RECOMMENDED ACTIONS:
                {% if priority == "critical" %}
                IMMEDIATE ACTION REQUIRED: This is a critical system alert that requires immediate attention.
                - Review the alert details above
                - Check system logs for additional context
                - Implement necessary fixes immediately
                - Contact system administrators if needed
                {% elif priority == "high" %}
                HIGH PRIORITY: This alert requires prompt attention.
                - Review the alert details
                - Investigate the root cause
                - Implement fixes within the next few hours
                {% elif priority == "medium" %}
                MEDIUM PRIORITY: This alert should be addressed soon.
                - Review the alert details
                - Plan appropriate fixes
                - Address within the next day
                {% else %}
                LOW PRIORITY: This is an informational alert.
                - Review the alert details
                - Monitor for any changes
                - Address during regular maintenance
                {% endif %}
                
                ---
                Secret Safe Platform - System Alert
                Generated at {{ timestamp }}
                """
            },
            
            "cleanup_report": {
                "html": """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Token Cleanup Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                        .stats-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📊 Token Cleanup Report</h1>
                            <p>Secret Safe Platform</p>
                        </div>
                        <div class="content">
                            <h2>Cleanup Report</h2>
                            <p>A detailed cleanup report has been generated for the Secret Safe platform.</p>
                            
                            <div class="stats-box">
                                <h3>📋 Report Information</h3>
                                <p><strong>Type:</strong> {{ report_type.title() }}</p>
                                <p><strong>Generated:</strong> {{ timestamp }}</p>
                                <p><strong>Task ID:</strong> {{ task_id }}</p>
                            </div>
                            
                            <div class="stats-box">
                                <h3>📊 Report Summary</h3>
                                <pre>{{ report_data|tojson(indent=2) }}</pre>
                            </div>
                            
                            <p><strong>Note:</strong> This is an automated cleanup report. Review the data above for any required actions.</p>
                        </div>
                        <div class="footer">
                            <p>Secret Safe Platform - Cleanup Report</p>
                            <p>Generated at {{ timestamp }}</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                "text": """
                TOKEN CLEANUP REPORT
                =====================
                
                Secret Safe Platform
                
                A detailed cleanup report has been generated.
                
                REPORT INFORMATION:
                - Type: {{ report_type.title() }}
                - Generated: {{ timestamp }}
                - Task ID: {{ task_id }}
                
                REPORT SUMMARY:
                {{ report_data|tojson(indent=2) }}
                
                Note: This is an automated cleanup report. Review the data above for any required actions.
                
                ---
                Secret Safe Platform - Cleanup Report
                Generated at {{ timestamp }}
                """
            }
        }


    def render_template(
        self,
        template_name: str,
        template_type: str,
        context: Dict[str, Any]
    ) -> str:
        """Render a template with the given context."""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")

        if template_type not in self.templates[template_name]:
            raise ValueError(
                f"Template type '{template_type}' not found for '{template_name}'")

        template = self.templates[template_name][template_type]
        return template.render(**context)

    def _get_verification_html_template(self) -> Template:
        """HTML template for email verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .verification-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verification-button:hover {
            transform: translateY(-2px);
        }
        .verification-link {
            word-break: break-all;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            color: #64748b;
            margin: 20px 0;
        }
        .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>Verify Your Email</h1>
            <p>Welcome to Secret Safe - Your Digital Inheritance Platform</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>Thank you for signing up for Secret Safe! To complete your registration and start securing your digital legacy, please verify your email address.</p>
            
            <div style="text-align: center;">
                <a href="{{ verification_url }}" class="verification-button">
                    Verify Email Address
                </a>
            </div>
            
            <p><strong>Verification Link:</strong></p>
            <div class="verification-link">
                {{ verification_url }}
            </div>
            
            <div class="info-box">
                <strong>What happens next?</strong><br>
                After verifying your email, you'll be able to:
                <ul>
                    <li>Create and manage your secret messages</li>
                    <li>Set up check-in schedules</li>
                    <li>Configure recipients for your messages</li>
                    <li>Access your secure vault</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>{{ expiry_hours }} hours</strong>. If you need a new link, you can request one from your account settings.</p>
            
            <p>If you didn't create a Secret Safe account, you can safely ignore this email.</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user.email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
            <p>
                <a href="{{ base_url }}/privacy">Privacy Policy</a> | 
                <a href="{{ base_url }}/terms">Terms of Service</a> | 
                <a href="{{ base_url }}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_verification_text_template(self) -> Template:
        """Plain text template for email verification."""
        return Template("""
SECRET SAFE - EMAIL VERIFICATION

Hello {{ user.first_name or user.email }},

Thank you for signing up for Secret Safe! To complete your registration and start securing your digital legacy, please verify your email address.

VERIFICATION LINK:
{{ verification_url }}

What happens next?
After verifying your email, you'll be able to:
- Create and manage your secret messages
- Set up check-in schedules
- Configure recipients for your messages
- Access your secure vault

Important: This verification link will expire in {{ expiry_hours }} hours. If you need a new link, you can request one from your account settings.

If you didn't create a Secret Safe account, you can safely ignore this email.

Best regards,
The Secret Safe Team

---
This email was sent to {{ user.email }}
© 2025 Secret Safe. All rights reserved.
{{ base_url }}/privacy | {{ base_url }}/terms | {{ base_url }}/support
        """)

    def _get_password_reset_html_template(self) -> Template:
        """HTML template for password reset."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
        }
        .security-notice {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>Reset Your Password</h1>
            <p>Secret Safe Account Security</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>We received a request to reset your Secret Safe account password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{ reset_url }}" class="reset-button">
                    Reset Password
                </a>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong><br>
                This password reset link will expire in {{ expiry_hours }} hours for your security. If you didn't request this reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">{{ reset_url }}</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Security Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user.email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_password_reset_text_template(self) -> Template:
        """Plain text template for password reset."""
        return Template("""
SECRET SAFE - PASSWORD RESET

Hello {{ user.first_name or user.email }},

We received a request to reset your Secret Safe account password. Use the link below to create a new password:

{{ reset_url }}

Security Notice:
This password reset link will expire in {{ expiry_hours }} hours for your security. If you didn't request this reset, please ignore this email and ensure your account is secure.

Best regards,
The Secret Safe Security Team

---
This email was sent to {{ user.email }}
© 2025 Secret Safe. All rights reserved.
        """)

    def _get_welcome_html_template(self) -> Template:
        """HTML template for welcome email after verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Secret Safe!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .feature-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉</div>
            <h1>Welcome to Secret Safe!</h1>
            <p>Your account is now verified and ready to use</p>
        </div>
        
        <div class="content">
            <h2>Congratulations, {{ user.first_name or user.email }}!</h2>
            
            <p>Your Secret Safe account has been successfully verified. You're now ready to start securing your digital legacy and ensuring your important messages reach their intended recipients.</p>
            
            <div style="text-align: center;">
                <a href="{{ dashboard_url }}" class="cta-button">
                    Go to Dashboard
                </a>
            </div>
            
            <div class="feature-box">
                <strong>What you can do now:</strong><br>
                <ul>
                    <li>🔐 Create your first secret message</li>
                    <li>👥 Add trusted recipients</li>
                    <li>⏰ Set up check-in schedules</li>
                    <li>📁 Organize your secure vault</li>
                    <li>⚙️ Customize your account settings</li>
                </ul>
            </div>
            
            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Visit your dashboard to see the platform overview</li>
                <li>Create your first message with our guided wizard</li>
                <li>Add recipients who should receive your messages</li>
                <li>Set up your check-in schedule</li>
                <li>Explore advanced features as you become comfortable</li>
            </ol>
            
            <p>If you have any questions or need help getting started, our support team is here to help!</p>
            
            <p>Welcome aboard!<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2025 Secret Safe. All rights reserved.</p>
            <p>
                <a href="{{ base_url }}/support">Support</a> | 
                <a href="{{ base_url }}/docs">Documentation</a> | 
                <a href="{{ base_url }}/community">Community</a>
            </p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_welcome_text_template(self) -> Template:
        """Plain text template for welcome email."""
        return Template("""
WELCOME TO SECRET SAFE!

Congratulations, {{ user.first_name or user.email }}!

Your Secret Safe account has been successfully verified. You're now ready to start securing your digital legacy and ensuring your important messages reach their intended recipients.

Go to Dashboard: {{ dashboard_url }}

What you can do now:
- Create your first secret message
- Add trusted recipients
- Set up check-in schedules
- Organize your secure vault
- Customize your account settings

Getting Started:
1. Visit your dashboard to see the platform overview
2. Create your first message with our guided wizard
3. Add recipients who should receive your messages
4. Set up your check-in schedule
5. Explore advanced features as you become comfortable

If you have any questions or need help getting started, our support team is here to help!

Welcome aboard!
The Secret Safe Team

---
© 2025 Secret Safe. All rights reserved.
{{ base_url }}/support | {{ base_url }}/docs | {{ base_url }}/community
        """)

    def _get_email_change_html_template(self) -> Template:
        """HTML template for email change verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email Change - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .info-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📧</div>
            <h1>Verify Email Change</h1>
            <p>Secret Safe Account Update</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>We received a request to change your email address from <strong>{{ old_email }}</strong> to <strong>{{ new_email }}</strong>.</p>
            
            <p>To confirm this change, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ verification_url }}" class="verify-button">
                    Confirm Email Change
                </a>
            </div>
            
            <div class="info-box">
                <strong>What happens next?</strong><br>
                After confirming this change:
                <ul>
                    <li>Your email address will be updated to {{ new_email }}</li>
                    <li>You'll need to use the new email for future logins</li>
                    <li>All notifications will be sent to the new address</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>{{ expiry_hours }} hours</strong>.</p>
            
            <p>If you didn't request this email change, please ignore this email and contact our support team immediately.</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ new_email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_email_change_text_template(self) -> Template:
        """Plain text template for email change verification."""
        return Template("""
SECRET SAFE - EMAIL CHANGE VERIFICATION

Hello {{ user.first_name or user.email }},

We received a request to change your email address from {{ old_email }} to {{ new_email }}.

To confirm this change, please use this link:
{{ verification_url }}

What happens next?
After confirming this change:
- Your email address will be updated to {{ new_email }}
- You'll need to use the new email for future logins
- All notifications will be sent to the new address

Important: This verification link will expire in {{ expiry_hours }} hours.

If you didn't request this email change, please ignore this email and contact our support team immediately.

Best regards,
The Secret Safe Team

---
This email was sent to {{ new_email }}
© 2025 Secret Safe. All rights reserved.
        """)


# Global template manager instance
email_template_manager = EmailTemplateManager()
