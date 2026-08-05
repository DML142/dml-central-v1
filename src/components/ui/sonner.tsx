'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'border-line bg-surface-raised text-text mono-copy flex w-full items-center gap-3 border px-4 py-3 shadow-lg',
          error: 'border-danger text-danger',
          success: 'border-violet-bright text-violet-bright',
        },
      }}
      {...props}
    />
  );
}
