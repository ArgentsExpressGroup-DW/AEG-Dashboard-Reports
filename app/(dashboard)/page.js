import { loadDashboard } from '../../lib/db';
import LandingClient from '../../components/LandingClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const d = await loadDashboard();
  return <LandingClient emps={d.emps} scale={d.scale} viol={d.viol} issues={d.issues} asOf={d.asOf} />;
}
