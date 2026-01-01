const { spawn } = require('child_process');
console.log('Attempting to spawn git...');

const child = spawn('git', ['--version'], { shell: true });

child.stdout.on('data', (data) => console.log(`stdout: ${data}`));
child.stderr.on('data', (data) => console.error(`stderr: ${data}`));
child.on('close', (code) => console.log(`child process exited with code ${code}`));
child.on('error', (err) => console.error(`Failed to start subprocess: ${err}`));

const child2 = spawn('git', ['--version'], { shell: false });
child2.on('error', (err) => console.error(`Failed to start subprocess (no shell): ${err}`));
child2.stdout.on('data', (data) => console.log(`stdout (no shell): ${data}`));
