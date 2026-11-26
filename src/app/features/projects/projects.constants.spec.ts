import { canRunProjectOperations, projectStatusTagColor } from './projects.constants';

describe('projects.constants', () => {
  describe('projectStatusTagColor', () => {
    it('maps known statuses', () => {
      expect(projectStatusTagColor('Planning')).toBe('default');
      expect(projectStatusTagColor('quote')).toBe('processing');
      expect(projectStatusTagColor('OPEN')).toBe('success');
      expect(projectStatusTagColor('Completed')).toBe('purple');
    });

    it('falls back for unknown or empty', () => {
      expect(projectStatusTagColor(undefined)).toBe('default');
      expect(projectStatusTagColor('other')).toBe('default');
    });
  });

  describe('canRunProjectOperations', () => {
    it('allows execute or update', () => {
      expect(canRunProjectOperations({ canExecute: true, canUpdate: false })).toBeTrue();
      expect(canRunProjectOperations({ canExecute: false, canUpdate: true })).toBeTrue();
      expect(canRunProjectOperations({ canUpdate: true })).toBeTrue();
      expect(canRunProjectOperations({ canExecute: false, canUpdate: false })).toBeFalse();
    });
  });
});
