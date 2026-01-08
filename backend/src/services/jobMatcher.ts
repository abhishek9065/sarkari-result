import { pool } from '../db.js';
import { UserProfileModel, UserProfile } from '../models/userProfiles.js';
import { Announcement } from '../types.js';

interface MatchResult {
    announcement: Announcement;
    matchScore: number;
    matchReasons: {
        category: number;
        qualification: number;
        location: number;
        recency: number;
    };
}

interface RecommendationResult extends Announcement {
    matchScore: number;
    matchReasons: Record<string, number>;
}

export class JobMatcherService {
    // Scoring weights (must add up to 100)
    private static readonly WEIGHTS = {
        category: 40,      // Category match
        qualification: 30, // Qualification match  
        location: 20,      // Location preference
        recency: 10        // How recent the posting is
    };

    /**
     * Calculate match score between a job and user profile
     */
    static calculateMatchScore(announcement: Announcement, profile: UserProfile): MatchResult {
        const matchReasons = {
            category: 0,
            qualification: 0,
            location: 0,
            recency: 0
        };

        // Category matching (40%)
        if (profile.preferredCategories && profile.preferredCategories.length > 0) {
            const categoryMatch = profile.preferredCategories.some(
                cat => announcement.category?.toLowerCase().includes(cat.toLowerCase()) ||
                    announcement.organization?.toLowerCase().includes(cat.toLowerCase())
            );
            if (categoryMatch) {
                matchReasons.category = this.WEIGHTS.category;
            }
        } else {
            // No preference = partial match
            matchReasons.category = this.WEIGHTS.category * 0.5;
        }

        // Qualification matching (30%)
        if (profile.preferredQualifications && profile.preferredQualifications.length > 0) {
            const qualMatch = profile.preferredQualifications.some(
                qual => announcement.minQualification?.toLowerCase().includes(qual.toLowerCase())
            );
            if (qualMatch) {
                matchReasons.qualification = this.WEIGHTS.qualification;
            }
        } else {
            matchReasons.qualification = this.WEIGHTS.qualification * 0.3;
        }

        // Location matching (20%)
        if (profile.preferredLocations && profile.preferredLocations.length > 0) {
            const locationMatch = profile.preferredLocations.some(
                loc => loc === 'All India' ||
                    announcement.location?.toLowerCase().includes(loc.toLowerCase())
            );
            if (locationMatch) {
                matchReasons.location = this.WEIGHTS.location;
            }
        } else {
            matchReasons.location = this.WEIGHTS.location * 0.5;
        }

        // Recency scoring (10%) - newer posts get higher scores
        if (announcement.postedAt) {
            const daysSincePosted = Math.floor(
                (Date.now() - new Date(announcement.postedAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSincePosted <= 1) {
                matchReasons.recency = this.WEIGHTS.recency;
            } else if (daysSincePosted <= 3) {
                matchReasons.recency = this.WEIGHTS.recency * 0.8;
            } else if (daysSincePosted <= 7) {
                matchReasons.recency = this.WEIGHTS.recency * 0.6;
            } else if (daysSincePosted <= 14) {
                matchReasons.recency = this.WEIGHTS.recency * 0.4;
            } else {
                matchReasons.recency = this.WEIGHTS.recency * 0.2;
            }
        }

        const matchScore = Object.values(matchReasons).reduce((a, b) => a + b, 0);

        return {
            announcement,
            matchScore: Math.round(matchScore * 100) / 100,
            matchReasons
        };
    }

    /**
     * Get personalized job recommendations for a user
     */
    static async getRecommendations(userId: number, limit: number = 10): Promise<RecommendationResult[]> {
        try {
            // Get user profile
            const profile = await UserProfileModel.findByUserId(userId);

            if (!profile) {
                // No profile = return recent jobs
                return this.getDefaultRecommendations(limit);
            }

            // Get active announcements
            const result = await pool.query(
                `SELECT 
                    id, title, slug, type, category, organization, 
                    external_link as "externalLink", location, deadline,
                    min_qualification as "minQualification", age_limit as "ageLimit",
                    total_posts as "totalPosts", posted_at as "postedAt",
                    view_count as "viewCount", is_active as "isActive"
                FROM announcements
                WHERE is_active = true
                  AND (deadline IS NULL OR deadline >= CURRENT_DATE)
                ORDER BY posted_at DESC
                LIMIT 100`
            );

            const announcements: Announcement[] = result.rows;

            // Calculate match scores
            const scoredJobs: MatchResult[] = announcements.map(ann =>
                this.calculateMatchScore(ann, profile)
            );

            // Sort by score and return top N
            const recommendations = scoredJobs
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit)
                .map(result => ({
                    ...result.announcement,
                    matchScore: result.matchScore,
                    matchReasons: result.matchReasons
                }));

            // Cache recommendations for performance (fire and forget)
            this.cacheRecommendations(userId, recommendations).catch(console.error);

            return recommendations;
        } catch (error) {
            console.error('[JobMatcher] Error getting recommendations:', error);
            return this.getDefaultRecommendations(limit);
        }
    }

    /**
     * Get default recommendations (recent jobs) when no profile exists
     */
    private static async getDefaultRecommendations(limit: number): Promise<RecommendationResult[]> {
        try {
            const result = await pool.query(
                `SELECT 
                    id, title, slug, type, category, organization,
                    external_link as "externalLink", location, deadline,
                    min_qualification as "minQualification", age_limit as "ageLimit",
                    total_posts as "totalPosts", posted_at as "postedAt",
                    view_count as "viewCount", is_active as "isActive"
                FROM announcements
                WHERE is_active = true
                ORDER BY posted_at DESC
                LIMIT $1`,
                [limit]
            );

            return result.rows.map(ann => ({
                ...ann,
                matchScore: 50, // Base score for non-personalized
                matchReasons: { default: 50 }
            }));
        } catch (error) {
            console.error('[JobMatcher] Error getting default recommendations:', error);
            return [];
        }
    }

    /**
     * Cache recommendations for faster retrieval
     */
    private static async cacheRecommendations(
        userId: number,
        recommendations: RecommendationResult[]
    ): Promise<void> {
        try {
            // Clear old recommendations
            await pool.query(
                `DELETE FROM job_recommendations WHERE user_id = $1`,
                [userId]
            );

            // Insert new recommendations
            for (const rec of recommendations.slice(0, 20)) {
                await pool.query(
                    `INSERT INTO job_recommendations (user_id, announcement_id, match_score, match_reasons)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (user_id, announcement_id) DO UPDATE
                    SET match_score = $3, match_reasons = $4, created_at = NOW()`,
                    [userId, rec.id, rec.matchScore, JSON.stringify(rec.matchReasons)]
                );
            }
        } catch (error) {
            console.error('[JobMatcher] Error caching recommendations:', error);
        }
    }

    /**
     * Get cached recommendations if available
     */
    static async getCachedRecommendations(userId: number, limit: number = 10): Promise<RecommendationResult[] | null> {
        try {
            const result = await pool.query(
                `SELECT 
                    a.id, a.title, a.slug, a.type, a.category, a.organization,
                    a.external_link as "externalLink", a.location, a.deadline,
                    a.min_qualification as "minQualification", a.age_limit as "ageLimit",
                    a.total_posts as "totalPosts", a.posted_at as "postedAt",
                    a.view_count as "viewCount", a.is_active as "isActive",
                    jr.match_score as "matchScore", jr.match_reasons as "matchReasons"
                FROM job_recommendations jr
                JOIN announcements a ON a.id = jr.announcement_id
                WHERE jr.user_id = $1
                  AND jr.expires_at > NOW()
                  AND a.is_active = true
                ORDER BY jr.match_score DESC
                LIMIT $2`,
                [userId, limit]
            );

            return result.rows.length > 0 ? result.rows : null;
        } catch (error) {
            console.error('[JobMatcher] Error getting cached recommendations:', error);
            return null;
        }
    }
}
