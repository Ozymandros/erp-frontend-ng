
export default async function globalTeardown() {
  console.log('Teoubleshooting Testcontainer...');
  // if (process.env.TESTCONTAINER_STOP_CALLBACK) {
  //    await process.env.TESTCONTAINER_STOP_CALLBACK();
  // }
}
