// Quick diagnostic to check if dark theme CSS variables are loaded
console.log('=== Dark Theme Diagnostic ===');

// Check if .dark class exists
const hasDarkClass = document.documentElement.classList.contains('dark');
console.log('Has .dark class:', hasDarkClass);

// Get computed styles
const styles = getComputedStyle(document.documentElement);

// Check light mode variables
console.log('\n--- Light Mode Variables (default) ---');
console.log('--app-bg-color:', styles.getPropertyValue('--app-bg-color'));
console.log('--app-text-color:', styles.getPropertyValue('--app-text-color'));
console.log('--app-success-text:', styles.getPropertyValue('--app-success-text'));
console.log('--app-error-text:', styles.getPropertyValue('--app-error-text'));

// Toggle dark mode
document.documentElement.classList.add('dark');
const darkStyles = getComputedStyle(document.documentElement);

console.log('\n--- Dark Mode Variables (after adding .dark) ---');
console.log('--app-bg-color:', darkStyles.getPropertyValue('--app-bg-color'));
console.log('--app-text-color:', darkStyles.getPropertyValue('--app-text-color'));
console.log('--app-success-text:', darkStyles.getPropertyValue('--app-success-text'));
console.log('--app-error-text:', darkStyles.getPropertyValue('--app-error-text'));

// Check if variables changed
const bgChanged = styles.getPropertyValue('--app-bg-color') !== darkStyles.getPropertyValue('--app-bg-color');
console.log('\n--- Result ---');
console.log('Variables changed when .dark added:', bgChanged);

if (!bgChanged) {
  console.error('❌ PROBLEM: Dark mode variables are NOT being applied!');
  console.log('This means the CSS is not loaded or the :root.dark selector is not working.');
} else {
  console.log('✅ SUCCESS: Dark mode variables are working correctly!');
}
