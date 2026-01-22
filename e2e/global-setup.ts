import { GenericContainer, StartedTestContainer } from 'testcontainers';

let container: StartedTestContainer;

export default async function globalSetup() {
  console.log('Starting MockServer container via Testcontainers...');
  
  try {
    container = await new GenericContainer("nginx:alpine")
      .withExposedPorts(80)
      .start();
    
    const host = container.getHost();
    const port = container.getMappedPort(80);
    const url = `http://${host}:${port}`;
    
    process.env['MOCK_SERVER_URL'] = url;
    console.log(`MockServer is running at: ${url}`);
    
    // Store the container in a way that teardown can access it if needed
    // (though Ryuk will clean it up anyway)
    (global as any).__MOCK_CONTAINER__ = container;
    
  } catch (error) {
    console.error('Failed to start Testcontainer:', error);
    // Don't fail the whole test suite if Docker is missing, just log it
  }
}

// export async function globalTeardown() {
//   // Stop container
// }
