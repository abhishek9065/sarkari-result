import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

interface MatchedJob {
    id: number;
    title: string;
    slug: string;
    organization: string;
    category: string;
    totalPosts: number;
    deadline: string;
    location: string;
    minQualification: string;
    ageLimit: string;
    matchScore: number;
    matchReasons: string[];
}

// Qualification hierarchy (higher index = higher qualification)
const QUALIFICATION_LEVELS: Record<string, number> = {
    '10th pass': 1,
    '12th pass': 2,
    'iti': 3,
    'diploma': 4,
    'graduate': 5,
    'post graduate': 6,
    'phd': 7,
};

// Age relaxation by category
const AGE_RELAXATION: Record<string, number> = {
    'general': 0,
    'obc': 3,
    'sc': 5,
    'st': 5,
    'ews': 0,
    'pwbd': 10,
};

/**
 * Match jobs based on user profile
 * GET /api/jobs/match?age=25&qualification=Graduate&location=Delhi&category=OBC&gender=Male
 */
router.get('/match', async (req, res) => {
    try {
        const {
            age = '25',
            qualification = 'Graduate',
            location = 'All India',
            category = 'General',
            gender = 'Male',
        } = req.query as Record<string, string>;

        const userAge = parseInt(age);
        const userQualLevel = QUALIFICATION_LEVELS[qualification.toLowerCase()] || 5;
        const ageRelaxation = AGE_RELAXATION[category.toLowerCase()] || 0;

        // Fetch active jobs with deadline in future
        let rows;
        try {
            const result = await pool.query(`
                SELECT 
                    id, title, slug, organization, category, 
                    total_posts, deadline, location,
                    min_qualification, age_limit, external_link,
                    min_qualification as "minQualification",
                    age_limit as "ageLimit"
                FROM announcements
                WHERE type = 'job' 
                  AND is_active = true 
                  AND (deadline IS NULL OR deadline > NOW())
                ORDER BY posted_at DESC
                LIMIT 100
            `);
            rows = result.rows;
        } catch (error) {
            console.error('[Job Match] DB Error, using mock data:', (error as Error).message);
            const { mockAnnouncements } = await import('../models/mockData.js');
            rows = mockAnnouncements.filter(a => a.type === 'job' && a.isActive);
        }

        const matchedJobs: MatchedJob[] = [];

        for (const job of rows) {
            const matchReasons: string[] = [];
            let matchScore = 0;

            // 1. Check qualification match (40 points)
            const jobQualLevel = getQualificationLevel(job.min_qualification);
            if (userQualLevel >= jobQualLevel) {
                matchScore += 40;
                matchReasons.push('Qualification eligible');
            } else {
                continue; // Skip if under-qualified
            }

            // 2. Check age match (30 points)
            const ageMatch = checkAgeEligibility(userAge, job.age_limit, ageRelaxation);
            if (ageMatch.eligible) {
                matchScore += 30;
                matchReasons.push('Age eligible');
            } else {
                continue; // Skip if age not eligible
            }

            // 3. Location match (20 points)
            const jobLocation = (job.location || 'All India').toLowerCase();
            const userLoc = location.toLowerCase();
            if (jobLocation === 'all india' || jobLocation.includes(userLoc) || userLoc === 'all india') {
                matchScore += 20;
                matchReasons.push('Location match');
            } else {
                matchScore += 10; // Partial score for non-matching location
            }

            // 4. Posts available (10 points)
            if (job.total_posts && job.total_posts > 100) {
                matchScore += 10;
                matchReasons.push(`${job.total_posts}+ vacancies`);
            } else if (job.total_posts) {
                matchScore += 5;
            }

            matchedJobs.push({
                id: job.id,
                title: job.title,
                slug: job.slug,
                organization: job.organization,
                category: job.category,
                totalPosts: job.total_posts,
                deadline: job.deadline,
                location: job.location,
                minQualification: job.min_qualification,
                ageLimit: job.age_limit,
                matchScore,
                matchReasons,
            });
        }

        // Sort by match score descending
        matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            count: matchedJobs.length,
            data: matchedJobs.slice(0, 20), // Return top 20 matches
        });
    } catch (error) {
        console.error('[Job Match] Error:', error);
        res.status(500).json({ error: 'Failed to match jobs' });
    }
});

/**
 * Get qualification level from text
 */
function getQualificationLevel(qualText: string | null): number {
    if (!qualText) return 1;
    const text = qualText.toLowerCase();

    for (const [qual, level] of Object.entries(QUALIFICATION_LEVELS)) {
        if (text.includes(qual)) return level;
    }

    // Common patterns
    if (text.includes('bachelor') || text.includes('b.')) return 5;
    if (text.includes('master') || text.includes('m.')) return 6;
    if (text.includes('10+2') || text.includes('intermediate')) return 2;
    if (text.includes('matric') || text.includes('ssc')) return 1;

    return 3; // Default to ITI level
}

/**
 * Check age eligibility with relaxation
 */
function checkAgeEligibility(
    userAge: number,
    ageLimitText: string | null,
    relaxation: number
): { eligible: boolean; message: string } {
    if (!ageLimitText) {
        return { eligible: true, message: 'No age limit specified' };
    }

    // Parse age limit like "18-35" or "21-27"
    const ageMatch = ageLimitText.match(/(\d+)\s*[-–to]+\s*(\d+)/);
    if (ageMatch) {
        const minAge = parseInt(ageMatch[1]);
        const maxAge = parseInt(ageMatch[2]) + relaxation;

        if (userAge >= minAge && userAge <= maxAge) {
            return { eligible: true, message: `Age ${minAge}-${maxAge} (with relaxation)` };
        }
        return { eligible: false, message: `Age limit: ${minAge}-${maxAge}` };
    }

    // Single max age like "35 years"
    const singleAge = ageLimitText.match(/(\d+)/);
    if (singleAge) {
        const maxAge = parseInt(singleAge[1]) + relaxation;
        if (userAge <= maxAge) {
            return { eligible: true, message: `Max age ${maxAge} (with relaxation)` };
        }
        return { eligible: false, message: `Max age: ${maxAge}` };
    }

    return { eligible: true, message: 'Could not parse age limit' };
}

export default router;
