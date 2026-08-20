import ComingSoon from '../../../components/ComingSoon';

export const metadata = { title: 'Market Analysis — HR Operations' };

export default function Page() {
  return (
    <ComingSoon
      title="Market Analysis"
      lead="Each role's description, its published band and the open-market rate side by side, so the scale can be defended or corrected."
      blocks={[
        {
          title: 'Role evaluation',
          subtitle: 'Needs the job descriptions.',
          blocked: 'The job descriptions for the 64 roles in the scale. Market rate data can be gathered once there is a description to match against.',
          planned: [
            'Description against band: does the scope described justify the range published',
            'Band against market: where each facility sits relative to local comparable pay',
            'Roles most exposed to being outbid, ranked',
            'Evidence for the ceiling-rule fixes flagged on Data Quality',
          ],
        },
      ]}
    />
  );
}
