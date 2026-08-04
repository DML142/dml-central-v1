'use client';

import { useEffect } from 'react';

import { Chip } from '@/components/common/Chip';
import { Eyebrow } from '@/components/common/Eyebrow';
import { IndexLabel } from '@/components/common/IndexLabel';
import { SectionShell } from '@/components/layout/SectionShell';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BREAKPOINTS } from '@/config/breakpoints';
import { STACK } from '@/content/stack';
import { useTranslate } from '@/hooks/use-translate';
import { useStackStore } from '@/stores/stack-store';

const panelId = (id: string) => `stack-${id}`;

export function StackSection() {
  const t = useTranslate();
  const openPanels = useStackStore((state) => state.openPanels);
  const setOpenPanels = useStackStore((state) => state.setOpenPanels);

  useEffect(() => {
    // A hash wins over the default: `#stack-backend` opens that panel and scrolls to it.
    const fromHash = window.location.hash.slice(1);
    const target = STACK.find((category) => panelId(category.id) === fromHash);

    if (target) {
      setOpenPanels([target.id]);
      document.getElementById(fromHash)?.scrollIntoView({ block: 'start' });
      return;
    }

    const isDesktop = window.matchMedia(`(min-width: ${String(BREAKPOINTS.lg)}px)`).matches;
    const first = STACK[0];
    if (isDesktop && first) setOpenPanels([first.id]);
  }, [setOpenPanels]);

  return (
    <SectionShell id="stack" title={t('stack.title')} count="06">
      <Accordion
        type="multiple"
        value={openPanels}
        onValueChange={setOpenPanels}
        className="border-line border-t"
      >
        {STACK.map((category) => (
          <AccordionItem key={category.id} value={category.id} id={panelId(category.id)}>
            <AccordionTrigger>
              <IndexLabel className="group-hover:text-violet group-data-[state=open]:text-violet">
                {category.index}
              </IndexLabel>
              <span className="font-display text-title leading-none uppercase">
                {t(category.nameKey)}
              </span>
              <Eyebrow>({category.items.length})</Eyebrow>
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <Chip key={item.id}>
                    {item.label}
                    {item.version ? ` ${item.version}` : ''}
                  </Chip>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}
