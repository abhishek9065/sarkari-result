// Layout Components
export * from './common/Header';
export * from './common/Navigation';
export * from './common/Footer';
export * from './common/Marquee';
export * from './sections/SectionTable';
export * from './common/SocialButtons';
export { SEO } from './common/SEO';

// Cards
export { FeaturedGrid } from './cards/FeaturedGrid';

// Sections
export { ExamCalendar } from './sections/ExamCalendar';
export { JobAlerts } from './sections/JobAlerts';
export { CompareJobs } from './sections/CompareJobs';

// Admin
export { AnalyticsDashboard } from './admin/AnalyticsDashboard';

// UI
export { SkeletonLoader } from './ui/SkeletonLoader';
export { ShareButtons } from './ui/ShareButtons';
export { PWAInstallPrompt } from './ui/PWAInstallPrompt';
export { SearchFilters } from './ui/SearchFilters';
export type { FilterState } from './ui/SearchFilters';
export { NotificationPrompt } from './ui/NotificationPrompt';
export { UserProfile } from './ui/UserProfile';
export { ExportButtons } from './ui/ExportButtons';
export { LazyImage } from './ui/LazyImage';
export {
    ToastContainer,
    ScrollToTop,
    LoadingSpinner,
    ProgressBar,
    PageTransition,
    AnimatedCounter,
    Skeleton,
    Tooltip,
    useToast,
    useInView
} from './ui/InteractiveComponents';
export {
    Breadcrumbs,
    StatCard,
    StatsSection,
    EmptyState,
    ErrorState,
    FilterChips,
    SortDropdown,
    Pagination,
    QuickActions,
    SearchBox
} from './ui/UXComponents';

// Common Components
export * from './common/TagsCloud';
export * from './common/SubscribeBox';
