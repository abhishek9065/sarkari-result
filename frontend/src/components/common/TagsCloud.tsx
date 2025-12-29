import { useState, useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_BASE ?? '';

export function TagsCloud() {
    const [tags, setTags] = useState<{ name: string, count: number }[]>([]);

    useEffect(() => {
        fetch(`${apiBase}/api/announcements/meta/tags`)
            .then(res => res.json())
            .then(data => setTags(data.data || []))
            .catch(console.error);
    }, []);

    if (tags.length === 0) return null;

    return (
        <div className="tags-cloud-section" style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#333', borderBottom: '2px solid #e74c3c', paddingBottom: '5px', display: 'inline-block' }}>🏷️ Browse by Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map(tag => (
                    <span
                        key={tag.name}
                        className="tag-chip"
                        style={{
                            background: '#f0f2f5',
                            padding: '5px 10px',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            color: '#555',
                            border: '1px solid #ddd'
                        }}
                        onClick={() => {
                            // Simple search by tag - navigating to search page would be better
                            window.location.href = `/?search=${encodeURIComponent(tag.name)}`;
                        }}
                    >
                        {tag.name} <small style={{ color: '#888' }}>({tag.count})</small>
                    </span>
                ))}
            </div>
        </div>
    );
}
