import { Eyebrow } from '@/components/common/Eyebrow';

interface Props {
  id: string;
  title: string;
  count: string;
  children: React.ReactNode;
}

/** A bordered section with the display title on the left and its item count on the right. */
export function SectionShell({ id, title, count, children }: Props) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <div className="border-line section-gutter flex items-baseline justify-between gap-4 border-b py-4">
        <h2 id={`${id}-title`} className="display text-title">
          {title}
        </h2>
        <Eyebrow>({count})</Eyebrow>
      </div>
      {children}
    </section>
  );
}
