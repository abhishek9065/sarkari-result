import { pool } from '../db.js';

export interface UserProfile {
    id: number;
    userId: number;
    preferredCategories: string[];
    preferredQualifications: string[];
    preferredLocations: string[];
    preferredOrganizations: string[];
    ageGroup: string | null;
    educationLevel: string | null;
    experienceYears: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: 'instant' | 'daily' | 'weekly';
    profileComplete: boolean;
    onboardingCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProfileUpdateInput {
    preferredCategories?: string[];
    preferredQualifications?: string[];
    preferredLocations?: string[];
    preferredOrganizations?: string[];
    ageGroup?: string;
    educationLevel?: string;
    experienceYears?: number;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notificationFrequency?: 'instant' | 'daily' | 'weekly';
}

export class UserProfileModel {
    /**
     * Get user profile by user ID
     */
    static async findByUserId(userId: number): Promise<UserProfile | null> {
        try {
            const result = await pool.query(
                `SELECT 
                    id,
                    user_id as "userId",
                    preferred_categories as "preferredCategories",
                    preferred_qualifications as "preferredQualifications",
                    preferred_locations as "preferredLocations",
                    preferred_organizations as "preferredOrganizations",
                    age_group as "ageGroup",
                    education_level as "educationLevel",
                    experience_years as "experienceYears",
                    email_notifications as "emailNotifications",
                    push_notifications as "pushNotifications",
                    notification_frequency as "notificationFrequency",
                    profile_complete as "profileComplete",
                    onboarding_completed as "onboardingCompleted",
                    created_at as "createdAt",
                    updated_at as "updatedAt"
                FROM user_profiles
                WHERE user_id = $1`,
                [userId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[UserProfile] Error finding profile:', error);
            throw error;
        }
    }

    /**
     * Create profile for user (called automatically via trigger, but manual fallback)
     */
    static async create(userId: number): Promise<UserProfile> {
        try {
            const result = await pool.query(
                `INSERT INTO user_profiles (user_id)
                VALUES ($1)
                ON CONFLICT (user_id) DO NOTHING
                RETURNING *`,
                [userId]
            );

            // If conflict, fetch existing
            if (result.rows.length === 0) {
                const existing = await this.findByUserId(userId);
                if (existing) return existing;
            }

            return this.findByUserId(userId) as Promise<UserProfile>;
        } catch (error) {
            console.error('[UserProfile] Error creating profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile preferences
     */
    static async update(userId: number, updates: ProfileUpdateInput): Promise<UserProfile | null> {
        try {
            const setClause: string[] = [];
            const values: any[] = [];
            let paramCount = 0;

            if (updates.preferredCategories !== undefined) {
                setClause.push(`preferred_categories = $${++paramCount}`);
                values.push(updates.preferredCategories);
            }
            if (updates.preferredQualifications !== undefined) {
                setClause.push(`preferred_qualifications = $${++paramCount}`);
                values.push(updates.preferredQualifications);
            }
            if (updates.preferredLocations !== undefined) {
                setClause.push(`preferred_locations = $${++paramCount}`);
                values.push(updates.preferredLocations);
            }
            if (updates.preferredOrganizations !== undefined) {
                setClause.push(`preferred_organizations = $${++paramCount}`);
                values.push(updates.preferredOrganizations);
            }
            if (updates.ageGroup !== undefined) {
                setClause.push(`age_group = $${++paramCount}`);
                values.push(updates.ageGroup);
            }
            if (updates.educationLevel !== undefined) {
                setClause.push(`education_level = $${++paramCount}`);
                values.push(updates.educationLevel);
            }
            if (updates.experienceYears !== undefined) {
                setClause.push(`experience_years = $${++paramCount}`);
                values.push(updates.experienceYears);
            }
            if (updates.emailNotifications !== undefined) {
                setClause.push(`email_notifications = $${++paramCount}`);
                values.push(updates.emailNotifications);
            }
            if (updates.pushNotifications !== undefined) {
                setClause.push(`push_notifications = $${++paramCount}`);
                values.push(updates.pushNotifications);
            }
            if (updates.notificationFrequency !== undefined) {
                setClause.push(`notification_frequency = $${++paramCount}`);
                values.push(updates.notificationFrequency);
            }

            if (setClause.length === 0) {
                return this.findByUserId(userId);
            }

            // Check if profile is complete after update
            setClause.push(`profile_complete = (
                COALESCE(array_length(preferred_categories, 1), 0) > 0 OR
                COALESCE(array_length(preferred_qualifications, 1), 0) > 0 OR
                age_group IS NOT NULL OR
                education_level IS NOT NULL
            )`);

            values.push(userId);

            await pool.query(
                `UPDATE user_profiles 
                SET ${setClause.join(', ')}
                WHERE user_id = $${paramCount + 1}`,
                values
            );

            return this.findByUserId(userId);
        } catch (error) {
            console.error('[UserProfile] Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Mark onboarding as completed
     */
    static async completeOnboarding(userId: number): Promise<void> {
        try {
            await pool.query(
                `UPDATE user_profiles 
                SET onboarding_completed = true 
                WHERE user_id = $1`,
                [userId]
            );
        } catch (error) {
            console.error('[UserProfile] Error completing onboarding:', error);
            throw error;
        }
    }

    /**
     * Get all profiles that match certain categories (for notifications)
     */
    static async findByPreferredCategories(categories: string[]): Promise<UserProfile[]> {
        try {
            const result = await pool.query(
                `SELECT 
                    id,
                    user_id as "userId",
                    preferred_categories as "preferredCategories",
                    email_notifications as "emailNotifications",
                    push_notifications as "pushNotifications",
                    notification_frequency as "notificationFrequency"
                FROM user_profiles
                WHERE preferred_categories && $1
                  AND (email_notifications = true OR push_notifications = true)`,
                [categories]
            );
            return result.rows;
        } catch (error) {
            console.error('[UserProfile] Error finding by categories:', error);
            throw error;
        }
    }
}
