import type { Announcement } from '../../types';
import { formatDate } from '../../utils/formatters';

interface SectionTableProps {
    title: string;
    items: Announcement[];
    onViewMore?: () => void;
    onItemClick: (item: Announcement) => void;
    fullWidth?: boolean;
}

export function SectionTable({ title, items, onViewMore, onItemClick, fullWidth }: SectionTableProps) {
    const formatShortDate = (date: string | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="section-table" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
            <div className="section-table-header">{title}</div>
            <div className="section-table-content">
                <ul>
                    {items.length > 0 ? (
                        items.slice(0, 10).map((item) => (
                            <li key={item.id}>
                                <a href="#" onClick={(e) => { e.preventDefault(); onItemClick(item); }}>
                                    {item.title}
                                    {item.totalPosts && ` [${item.totalPosts} Post]`}
                                    {item.deadline && ` - Last: ${formatShortDate(item.deadline)}`}
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>No {title.toLowerCase()} available at the moment.</li>
                    )}
                </ul>
            </div>
            {onViewMore && (
                <div className="section-table-footer">
                    <button className="view-more-btn" onClick={onViewMore}>View More</button>
                </div>
            )}
        </div>
    );
}
