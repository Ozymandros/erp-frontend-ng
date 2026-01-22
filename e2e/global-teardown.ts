
export default async function globalTeardown() {
  console.log('Stopping Testcontainers...');
  const container = (global as any).__MOCK_CONTAINER__;
  if (container) {
    await container.stop();
    console.log('MockServer container stopped.');
  }
}
