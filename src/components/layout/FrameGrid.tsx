interface Props {
  children: React.ReactNode;
}

/**
 * The hairline frame from tech.md 3: meta text on the outer edges, a bordered box inside it, and
 * a rail column that only exists from `lg` up.
 */
export function FrameGrid({ children }: Props) {
  return <div className="max-w-page mx-auto flex flex-col gap-3">{children}</div>;
}

export function FrameBox({ children }: Props) {
  return <div className="border-line lg:frame-columns grid grid-cols-1 border">{children}</div>;
}
