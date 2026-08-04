import { cn } from '@/lib/utils';

const TONES = {
  muted: 'text-text-muted',
  faint: 'text-text-faint',
  accent: 'text-violet-bright',
} as const;

interface Props {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  as?: 'span' | 'p';
}

export function Eyebrow({ children, tone = 'faint', className, as: Tag = 'span' }: Props) {
  return <Tag className={cn('micro', TONES[tone], className)}>{children}</Tag>;
}
