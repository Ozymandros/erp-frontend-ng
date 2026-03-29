/**
 * CSS classes applied to NG-Zorro modals so global styles can target
 * app shell modals consistently (light/dark theme in styles.scss).
 */
export const APP_MODAL_WRAP_CLASS = 'app-modal-wrap';

/** Applied to the dialog root (together with Ant Design classes). */
export const APP_MODAL_CLASS = 'app-modal';

/** Programmatic confirm() and preset info/success/warning/error modals. */
export const APP_MODAL_CONFIRM_SKIN_CLASS = 'app-modal--confirm';

/** Merges class strings without duplicates (order: first arg first, then each extra). */
export function mergeAppModalClasses(
  base: string,
  extra?: string | null,
  ...more: (string | null | undefined)[]
): string {
  const parts = [
    ...base.split(/\s+/),
    ...(extra?.split(/\s+/) ?? []),
    ...more.flatMap((m) => m?.split(/\s+/) ?? []),
  ].filter(Boolean);
  return [...new Set(parts)].join(' ');
}
