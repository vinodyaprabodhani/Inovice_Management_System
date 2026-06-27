import { rolldown } from 'rolldown';

async function run() {
  try {
    console.log('Starting rolldown build...');
    const build = await rolldown({
      input: 'vite.config.js',
    });
    const result = await build.generate();
    console.log('Build succeeded!');
  } catch (e) {
    console.error('Build failed with error:');
    console.error(e);
  }
}
run();
