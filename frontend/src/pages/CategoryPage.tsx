import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../components';
import { API_BASE } from '../utils';
import type { Announcement, ContentType } from '../types';

interface CategoryPageProps {
    type: ContentType;
}

const CATEGORY_TITLES: Record<ContentType, string> = {
    'job': 'Latest Government Jobs',
    'result': 'Latest Results',
    'admit-card': 'Admit Cards',
    'answer-key': 'Answer Keys',
    'admission': 'Admissions',
    'syllabus': 'Syllabus'
};

export function CategoryPage({ type }: CategoryPageProps) {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/api/announcements?type=${type}`)
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [type]);

    const handleItemClick = (item: Announcement) => {
        navigate(`/${item.type}/${item.slug}`);
    };

    return (
        <main className="main-content">
            <h1 className="category-title">{CATEGORY_TITLES[type]}</h1>

            {loading ? (
                <SkeletonLoader />
            ) : (
                <div className="category-list">
                    {data.length > 0 ? (
                        data.map(item => (
                            <div
                                key={item.id}
                                className="category-item"
                                onClick={() => handleItemClick(item)}
                            >
                                <div className="item-title">{item.title}</div>
                                <div className="item-meta">
                                    <span className="org">{item.organization}</span>
                                    {item.totalPosts && <span className="posts">{item.totalPosts} Posts</span>}
                                    {item.deadline && (
                                        <span className="deadline">Last: {new Date(item.deadline).toLocaleDateString('en-IN')}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No {type}s available at the moment.</p>
                    )}
                </div>
            )}
        </main>
    );
}
