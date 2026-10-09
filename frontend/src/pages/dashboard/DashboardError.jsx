import { Card } from '../../components/ui/Card.jsx';
import { ErrorState } from '../../components/ui/StateViews.jsx';
import { getErrorMessage } from '../../services/profileService.js';

function DashboardError({ error, onRetry }) {
  return (
    <Card>
      <ErrorState title="We couldn't load your dashboard" message={getErrorMessage(error)} onRetry={onRetry} />
    </Card>
  );
}

export default DashboardError;
