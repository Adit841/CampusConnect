import { SectionCard } from '../ui/Card.jsx';
import { DataSourceBadge } from '../ui/Badge.jsx';
import { EmptyState, SkeletonList } from '../ui/StateViews.jsx';

/**
 * A dashboard section that shows a skeleton while loading, an empty state when `items` is empty,
 * and otherwise calls `children(items)` to render the list.
 */
function DataSection({ title, icon, viewAllTo, loading, source, items, emptyTitle, emptyDescription, className, children }) {
  let content;
  if (loading) content = <SkeletonList />;
  else if (!items || items.length === 0) content = <EmptyState title={emptyTitle} description={emptyDescription} />;
  else content = children(items);

  return (
    <SectionCard
      title={title}
      icon={icon}
      viewAllTo={viewAllTo}
      badge={<DataSourceBadge source={source} />}
      className={className}
    >
      {content}
    </SectionCard>
  );
}

export default DataSection;
