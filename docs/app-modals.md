# App modals (theme + reuse)

## Programmatic dialogs

Inject **`AppConfirmDialogService`** instead of `NzModalService` for:

- `confirm()` — OK / Cancel
- `deleteConfirm()` — delete flows (defaults title, body, danger OK)
- `info()`, `success()`, `warning()`, `error()`
- `create()` — custom component / template modals

The service applies:

- `nzWrapClassName`: `app-modal-wrap`
- `nzClassName`: `app-modal app-modal--confirm` (merged with any class you pass)

Global styles in `styles.scss` target these hooks for light/dark (including confirm title/body text).

Use `underlying` only if you must call `NzModalService` without app defaults.

## Template `nz-modal`

On each `<nz-modal>`, add **`appThemedModal`** so the same CSS hooks apply:

```html
<nz-modal
  appThemedModal
  [(nzVisible)]="visible"
  nzTitle="Example"
  (nzOnCancel)="visible = false"
>
  <ng-container *nzModalContent>…</ng-container>
</nz-modal>
```

Optional extra classes: set `nzClassName` / `nzWrapClassName` as usual; they are **merged** with the app defaults.

## Constants

Import from `src/app/shared/components` (barrel) or `app/shared/constants/app-modal.constants`:

- `APP_MODAL_WRAP_CLASS`, `APP_MODAL_CLASS`, `APP_MODAL_CONFIRM_SKIN_CLASS`
- `mergeAppModalClasses()`
