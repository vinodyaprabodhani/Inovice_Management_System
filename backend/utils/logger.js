const db = require('../config/db');

/**
 * Log an action to the audit_logs table
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Description of the action (e.g., 'Created Invoice')
 * @param {string} entityType - Type of entity affected (e.g., 'Invoice', 'Customer')
 * @param {number} entityId - ID of the entity affected
 */
exports.logActivity = async (userId, action, entityType = null, entityId = null) => {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [userId, action, entityType, entityId]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};
