import {
  formatDisplayValue,
  JSON_DISPLAY_MAX_LENGTH,
  looksLikeJson,
} from './json-display.util';

describe('formatDisplayValue', () => {
  it('returns em dash for null and empty', () => {
    expect(formatDisplayValue(null).text).toBe('—');
    expect(formatDisplayValue('').text).toBe('—');
  });

  it('prettifies valid JSON objects', () => {
    const result = formatDisplayValue('{"a":1,"b":2}');
    expect(result.isJson).toBe(true);
    expect(result.text).toContain('"a": 1');
    expect(result.text).toContain('"b": 2');
  });

  it('prettifies valid JSON arrays', () => {
    const result = formatDisplayValue('[1,2,3]');
    expect(result.isJson).toBe(true);
    expect(result.text).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('returns trimmed raw string when JSON parse fails', () => {
    const result = formatDisplayValue('{not json}');
    expect(result.isJson).toBe(false);
    expect(result.text).toBe('{not json}');
  });

  it('strips control characters', () => {
    const result = formatDisplayValue('hello\u0007world');
    expect(result.text).toBe('helloworld');
  });

  it('preserves tab and newline', () => {
    const result = formatDisplayValue('a\tb\nc');
    expect(result.text).toBe('a\tb\nc');
  });

  it('truncates very long output', () => {
    const long = 'x'.repeat(JSON_DISPLAY_MAX_LENGTH + 100);
    const result = formatDisplayValue(long);
    expect(result.truncated).toBe(true);
    expect(result.text).toContain('truncated for display');
  });
});

describe('looksLikeJson', () => {
  it('detects object and array shapes', () => {
    expect(looksLikeJson('{}')).toBe(true);
    expect(looksLikeJson('[]')).toBe(true);
    expect(looksLikeJson('plain')).toBe(false);
  });
});
