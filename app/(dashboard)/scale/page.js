import { loadDashboard } from '../../../lib/db';
import ScaleClient from '../../../components/ScaleClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Department Salary Scale — HR Operations' };

export default async function Page() {
  const d = await loadDashboard();
  return <ScaleClient scale={d.scale} viol={d.viol} />;
}
