import { loadDashboard } from '../../../lib/db';
import QualityClient from '../../../components/QualityClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Data Quality — HR Operations' };

export default async function Page() {
  const d = await loadDashboard();
  return <QualityClient issues={d.issues} viol={d.viol} />;
}
