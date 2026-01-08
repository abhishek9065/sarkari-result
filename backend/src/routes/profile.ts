import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { UserProfileModel, ProfileUpdateInput } from '../models/userProfiles.js';
import { JobMatcherService } from '../services/jobMatcher.js';

const router = Router();

// Validation schemas
const profileUpdateSchema = z.object({
    preferredCategories: z.array(z.string()).optional(),
    preferredQualifications: z.array(z.string()).optional(),
    preferredLocations: z.array(z.string()).optional(),
    preferredOrganizations: z.array(z.string()).optional(),
    ageGroup: z.enum(['18-25', '25-30', '30-35', '35-40', '40+']).optional(),
    educationLevel: z.enum(['10th', '12th', 'Graduate', 'Post-Graduate', 'PhD']).optional(),
    experienceYears: z.number().min(0).max(50).optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    notificationFrequency: z.enum(['instant', 'daily', 'weekly']).optional(),
});

/**
 * GET /api/profile
 * Get current user's profile with preferences
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        let profile = await UserProfileModel.findByUserId(userId);

        // Create profile if doesn't exist
        if (!profile) {
            profile = await UserProfileModel.create(userId);
        }

        return res.json({
            data: profile,
            message: 'Profile retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/profile
 * Update user profile preferences
 */
router.put('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const validation = profileUpdateSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid profile data',
                details: validation.error.errors
            });
        }

        const updates: ProfileUpdateInput = validation.data;
        const profile = await UserProfileModel.update(userId, updates);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        return res.json({
            data: profile,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /api/profile/recommendations
 * Get personalized job recommendations based on profile
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

        const recommendations = await JobMatcherService.getRecommendations(userId, limit);

        return res.json({
            data: recommendations,
            count: recommendations.length,
            message: 'Recommendations generated successfully'
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

/**
 * POST /api/profile/complete-onboarding
 * Mark user onboarding as completed
 */
router.post('/complete-onboarding', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        await UserProfileModel.completeOnboarding(userId);

        return res.json({
            message: 'Onboarding completed successfully'
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return res.status(500).json({ error: 'Failed to complete onboarding' });
    }
});

/**
 * GET /api/profile/options
 * Get available options for profile preferences (categories, qualifications, etc.)
 */
router.get('/options', async (_req, res) => {
    try {
        // These could also come from database if needed
        const options = {
            categories: [
                'SSC', 'Railway', 'Banking', 'UPSC', 'State PSC', 'Defence',
                'Police', 'Teaching', 'Medical', 'Engineering', 'IT', 'Other'
            ],
            qualifications: [
                '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate',
                'Post-Graduate', 'PhD', 'B.Tech', 'M.Tech', 'MBBS', 'B.Ed'
            ],
            ageGroups: ['18-25', '25-30', '30-35', '35-40', '40+'],
            educationLevels: ['10th', '12th', 'Graduate', 'Post-Graduate', 'PhD'],
            notificationFrequencies: ['instant', 'daily', 'weekly'],
            locations: [
                'All India', 'Delhi', 'Maharashtra', 'Uttar Pradesh', 'Tamil Nadu',
                'Karnataka', 'West Bengal', 'Rajasthan', 'Gujarat', 'Madhya Pradesh'
            ]
        };

        return res.json({ data: options });
    } catch (error) {
        console.error('Error fetching options:', error);
        return res.status(500).json({ error: 'Failed to fetch options' });
    }
});

export default router;
