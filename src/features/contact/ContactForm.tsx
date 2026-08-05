'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { FormField } from '@/features/contact/FormField';
import { useTranslate } from '@/hooks/use-translate';
import { postJson } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  createContactSchema,
  MESSAGE_COUNTER_AT,
  MESSAGE_MAX,
  type ContactInput,
  type ContactResponse,
  type ContactValues,
} from '@/lib/validation/contact';

/** Neither of these has a visible field, so a failure on them cannot highlight anything. */
const SPAM_TRAP_FIELDS = new Set(['company', 'startedAt']);
/** Server-reported field names that have a visible input to attach the message to. */
const VISIBLE_FIELDS = ['name', 'email', 'telegram', 'message'] as const;

type Failure = 'none' | 'fields' | 'trap' | 'rate_limited' | 'delivery' | 'network';

interface Props {
  onSent: () => void;
}

export function ContactForm({ onSent }: Props) {
  const t = useTranslate();
  const [failure, setFailure] = useState<Failure>('none');
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  const {
    control,
    register,
    setValue,
    setError,
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

  function handleServerResponse(response: ContactResponse) {
    if (response.ok) {
      setFailure('none');
      // Distinct from `form.successTitle`, which the confirmation panel already shows on screen —
      // the same text in both would announce twice and make the two elements ambiguous to find.
      toast.success(t('form.successEyebrow'));
      onSent();
      return;
    }

    if (response.error === 'validation') {
      for (const field of VISIBLE_FIELDS) {
        const message = response.fields[field];
        if (message) setError(field, { message });
      }
      const onlyTrap = Object.keys(response.fields).every((key) => SPAM_TRAP_FIELDS.has(key));
      setFailure(onlyTrap ? 'trap' : 'fields');
      return;
    }

    if (response.error === 'rate_limited') {
      setRetryAfterSeconds(response.retryAfter);
      setFailure('rate_limited');
      toast.error(t('err.rateLimited', { n: Math.max(1, Math.ceil(response.retryAfter / 60)) }));
      return;
    }

    setFailure('delivery');
    toast.error(t('err.delivery'));
  }

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const response = await postJson<ContactResponse>('/api/contact', values);
        handleServerResponse(response);
      } catch {
        // `ApiRequestError`'s network/timeout/parse kinds all read the same to the visitor:
        // the request never reached a server that could answer.
        setFailure('network');
        toast.error(t('err.network'));
      }
    },
    (invalid) => {
      // A submission under the fill-time floor, or a filled honeypot, would otherwise fail with
      // nothing on screen: neither field is visible, so there is nothing to highlight.
      const onlyTrap = Object.keys(invalid).every((key) => SPAM_TRAP_FIELDS.has(key));
      setFailure(onlyTrap ? 'trap' : 'fields');
    },
  );

  const bannerMessage: string | null = (() => {
    switch (failure) {
      case 'trap':
        return t('err.banner');
      case 'fields':
        return t('err.announce');
      case 'rate_limited':
        return t('err.rateLimited', { n: Math.max(1, Math.ceil(retryAfterSeconds / 60)) });
      case 'delivery':
        return t('err.delivery');
      case 'network':
        return t('err.network');
      default:
        return null;
    }
  })();

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="section-gutter flex flex-col gap-6 py-8"
    >
      {bannerMessage && (
        <p role="alert" className="border-danger text-danger mono-copy border px-4 py-3">
          {bannerMessage}
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
