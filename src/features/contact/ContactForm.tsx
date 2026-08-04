'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { FormField } from '@/features/contact/FormField';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import {
  createContactSchema,
  MESSAGE_COUNTER_AT,
  MESSAGE_MAX,
  type ContactInput,
  type ContactValues,
} from '@/lib/validation/contact';

/** Neither of these has a visible field, so a failure on them cannot highlight anything. */
const SPAM_TRAP_FIELDS = new Set(['company', 'startedAt']);

interface Props {
  onSent: () => void;
}

export function ContactForm({ onSent }: Props) {
  const t = useTranslate();
  const [failure, setFailure] = useState<'none' | 'fields' | 'trap'>('none');

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(createContactSchema(t)),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      telegram: '',
      message: '',
      company: '',
      startedAt: 0,
    },
  });

  // Stamped after mount rather than during render: `Date.now()` is impure, and the value only has
  // to be older than the submit for the timing check to mean anything.
  useEffect(() => {
    setValue('startedAt', Date.now());
  }, [setValue]);

  // `useWatch` rather than `watch()`: the React Compiler cannot memoize the function form.
  const messageLength = useWatch({ control, name: 'message' }).length;

  const onSubmit = handleSubmit(
    () => {
      // Delivery is stubbed until phase 7 lands POST /api/contact.
      setFailure('none');
      onSent();
    },
    (invalid) => {
      // A submission under the fill-time floor, or a filled honeypot, would otherwise fail with
      // nothing on screen: neither field is visible, so there is nothing to highlight.
      const onlyTrap = Object.keys(invalid).every((key) => SPAM_TRAP_FIELDS.has(key));
      setFailure(onlyTrap ? 'trap' : 'fields');
    },
  );

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="section-gutter flex flex-col gap-6 py-8"
    >
      {failure !== 'none' && (
        <p role="alert" className="border-danger text-danger mono-copy border px-4 py-3">
          {failure === 'trap' ? t('err.banner') : t('err.announce')}
        </p>
      )}

      <FormField name="name" label={t('form.name')} error={errors.name?.message}>
        {(props) => (
          <input
            type="text"
            autoComplete="name"
            placeholder={t('form.namePlaceholder')}
            {...props}
            {...register('name')}
          />
        )}
      </FormField>

      <FormField name="email" label={t('form.email')} error={errors.email?.message}>
        {(props) => (
          <input
            type="email"
            autoComplete="email"
            placeholder={t('form.emailPlaceholder')}
            {...props}
            {...register('email')}
          />
        )}
      </FormField>

      <FormField
        name="telegram"
        label={t('form.telegram')}
        aside={<Eyebrow>{t('form.optional')}</Eyebrow>}
        error={errors.telegram?.message}
      >
        {(props) => (
          <input
            type="text"
            placeholder={t('form.telegramPlaceholder')}
            {...props}
            {...register('telegram')}
          />
        )}
      </FormField>

      <FormField
        name="message"
        label={t('form.message')}
        aside={
          // The counter only appears once the limit is close enough to matter.
          messageLength >= MESSAGE_MAX * MESSAGE_COUNTER_AT ? (
            <span className="micro text-violet-bright">
              {messageLength} / {MESSAGE_MAX}
            </span>
          ) : undefined
        }
        error={errors.message?.message}
      >
        {({ className, ...props }) => (
          <textarea
            rows={6}
            placeholder={t('form.messagePlaceholder')}
            className={cn(className, 'min-h-35 resize-y leading-relaxed')}
            {...props}
            {...register('message')}
          />
        )}
      </FormField>

      {/* Off-screen rather than hidden, so a bot that reads the DOM still fills it in. */}
      <div aria-hidden="true" className="honeypot">
        <label htmlFor="field-company">{t('form.company')}</label>
        <input
          id="field-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company')}
        />
      </div>

      <CtaButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('form.sending') : t('form.submit')}
      </CtaButton>
    </form>
  );
}
