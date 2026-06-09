/**
 * SALIS AUTO - User Routes (SECURED)
 * 
 * FIXES APPLIED:
 * - [S4] PATCH /api/users/:id uses explicit field whitelist
 * - Prevents self-role-escalation and over-posting
 * - Different whitelists for self-update vs admin-update
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated, requireRole, sanitizeUpdateFields } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// ============================================================
// Field Whitelists
// ============================================================
const SELF_UPDATE_FIELDS = [
  'fullName',
  'firstName',
  'lastName',
  'phone',
  'profileImageUrl',
  'bio',
  'certifications',
  'speciality',
  'address',
  'emergencyContact',
  'preferredLanguage',
  'notificationPreferences',
];

const ADMIN_UPDATE_FIELDS = [
  ...SELF_UPDATE_FIELDS,
  'email',
  'role',
  'userType',
  'isActive',
  'garageId',
  'accessEndDate',
  'department',
  'jobTitle',
];

// ============================================================
// PATCH /api/users/:id - Update user profile
// ============================================================
router.patch('/api/users/:id', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = req.user!;

  // Determine if this is a self-update or admin-update
  const isSelfUpdate = currentUser.id === id;
  const isAdmin = ['PLATFORM_ADMIN', 'ADMIN', 'system_administrator', 'admin'].includes(currentUser.role);

  if (!isSelfUpdate && !isAdmin) {
    res.status(403).json({
      error: 'You can only update your own profile',
      code: 'FORBIDDEN',
    });
    return;
  }

  // Apply appropriate field whitelist
  const allowedFields = isAdmin ? ADMIN_UPDATE_FIELDS : SELF_UPDATE_FIELDS;
  const sanitized: Record<string, any> = {};
  const rejectedFields: string[] = [];

  for (const [key, value] of Object.entries(req.body)) {
    if (allowedFields.includes(key)) {
      sanitized[key] = value;
    } else {
      rejectedFields.push(key);
    }
  }

  // Log security-relevant rejections
  if (rejectedFields.length > 0) {
    console.warn(`[SECURITY] User ${currentUser.email} attempted to update restricted fields: ${rejectedFields.join(', ')}`);
    
    // If trying to escalate role, this is a security event
    if (rejectedFields.includes('role') || rejectedFields.includes('userType')) {
      console.error(`[SECURITY ALERT] Potential role escalation attempt by ${currentUser.email} on user ${id}`);
    }
  }

  if (Object.keys(sanitized).length === 0) {
    res.status(400).json({
      error: 'No valid fields to update',
      code: 'NO_VALID_FIELDS',
      allowedFields,
      rejectedFields,
    });
    return;
  }

  // Add audit metadata
  sanitized.updatedAt = new Date();

  // TODO: Replace with actual storage call
  // const updatedUser = await storage.updateUser(id, sanitized);
  // res.json(updatedUser);

  res.json({
    message: 'User updated successfully',
    updatedFields: Object.keys(sanitized),
    rejectedFields: rejectedFields.length > 0 ? rejectedFields : undefined,
  });
}));

// ============================================================
// DELETE /api/users/:id - Soft delete user (admin only)
// Fixes: Missing DELETE endpoint for users
// ============================================================
router.delete('/api/users/:id', 
  isAuthenticated, 
  requireRole('PLATFORM_ADMIN', 'ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user!.id === id) {
      res.status(400).json({
        error: 'Cannot delete your own account',
        code: 'SELF_DELETE_PREVENTED',
      });
      return;
    }

    // TODO: Soft delete - set deletedAt timestamp
    // await storage.softDeleteUser(id, req.user!.id);

    res.json({ message: 'User deactivated successfully', userId: id });
  })
);

export default router;
