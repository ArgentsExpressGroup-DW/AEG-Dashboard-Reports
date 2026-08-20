import ComingSoon from '../../../components/ComingSoon';

export const metadata = { title: 'Metrics & Budgets — HR Operations' };

export default function Page() {
  return (
    <ComingSoon
      title="Metrics & Budgets"
      lead="Salary set against what the business earns, so pay decisions can be judged against capacity rather than in isolation."
      blocks={[
        {
          title: 'Revenue and profit',
          subtitle: 'Needs a source before any of it can be computed.',
          blocked: 'A revenue and profit feed by department and location. Cargowise, the GL, or a periodic extract would all work.',
          planned: [
            'Total revenue and total profit tiles beside the existing payroll totals',
            'Salary as a percentage of revenue, and of profit, per department and facility',
            'Exception colouring against a tolerance you set — green inside, amber approaching, red past',
            'Cost of a modelled scale increase expressed as a share of revenue, not just dollars',
          ],
        },
      ]}
    />
  );
}
