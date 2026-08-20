import { loadDashboard } from '../../../lib/db';
import OutlookClient from '../../../components/OutlookClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Department Outlook — HR Operations' };

export default async function Page() {
  const d = await loadDashboard();
  return <OutlookClient emps={d.emps} />;
}
