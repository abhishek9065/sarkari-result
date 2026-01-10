import { ObjectId, WithId, Document } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getCollection } from '../services/cosmosdb.js';

/**
 * User document interface for MongoDB
 */
interface UserDoc extends Document {
    _id: ObjectId;
    email: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}

export interface User {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

/**
 * MongoDB-based User Model
 */
export class UserModelMongo {
    private static get collection() {
        return getCollection<UserDoc>('users');
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        try {
            const doc = await this.collection.findOne({ email: email.toLowerCase() });
            return doc ? this.docToUser(doc) : null;
        } catch (error) {
            console.error('[MongoDB] findByEmail error:', error);
            return null;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(id: string): Promise<User | null> {
        try {
            if (!ObjectId.isValid(id)) return null;
            const doc = await this.collection.findOne({ _id: new ObjectId(id) });
            return doc ? this.docToUser(doc) : null;
        } catch (error) {
            console.error('[MongoDB] findById error:', error);
            return null;
        }
    }

    /**
     * Create new user
     */
    static async create(data: {
        email: string;
        username: string;
        password: string;
        role?: 'admin' | 'user';
    }): Promise<User> {
        const passwordHash = await bcrypt.hash(data.password, 10);
        const now = new Date();

        const doc: Omit<UserDoc, '_id'> = {
            email: data.email.toLowerCase(),
            username: data.username,
            passwordHash,
            role: data.role || 'user',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        const result = await this.collection.insertOne(doc as UserDoc);
        return this.findById(result.insertedId.toString()) as Promise<User>;
    }

    /**
     * Verify password and get user
     */
    static async verifyPassword(email: string, password: string): Promise<User | null> {
        try {
            const doc = await this.collection.findOne({
                email: email.toLowerCase(),
                isActive: true
            });

            if (!doc) return null;

            const isValid = await bcrypt.compare(password, doc.passwordHash);
            if (!isValid) return null;

            // Update last login
            await this.collection.updateOne(
                { _id: doc._id },
                { $set: { lastLogin: new Date() } }
            );

            return this.docToUser(doc);
        } catch (error) {
            console.error('[MongoDB] verifyPassword error:', error);
            return null;
        }
    }

    /**
     * Update user
     */
    static async update(id: string, data: Partial<{
        username: string;
        email: string;
        password: string;
        role: 'admin' | 'user';
        isActive: boolean;
    }>): Promise<User | null> {
        if (!ObjectId.isValid(id)) return null;

        const updateData: any = { updatedAt: new Date() };

        if (data.username) updateData.username = data.username;
        if (data.email) updateData.email = data.email.toLowerCase();
        if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);
        if (data.role) updateData.role = data.role;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return this.findById(id);
    }

    /**
     * Delete user
     */
    static async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    /**
     * Get all users (admin only)
     */
    static async findAll(): Promise<User[]> {
        try {
            const docs = await this.collection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();
            return docs.map(this.docToUser);
        } catch (error) {
            console.error('[MongoDB] findAll users error:', error);
            return [];
        }
    }

    /**
     * Convert document to User type
     */
    private static docToUser(doc: WithId<UserDoc>): User {
        return {
            id: doc._id.toString(),
            email: doc.email,
            username: doc.username,
            role: doc.role,
            isActive: doc.isActive,
            createdAt: doc.createdAt?.toISOString(),
            lastLogin: doc.lastLogin?.toISOString(),
        };
    }
}

export default UserModelMongo;
