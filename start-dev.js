const { spawn } = require('child_process');

console.log('Starting SERAS Concurrent Services...');

// 1. Start Email SMTP Service
const emailService = spawn('node', ['email-service/server.js'], { stdio: 'inherit', shell: true });
emailService.on('error', (err) => console.error('Failed to start email-service:', err));

// 2. Start Student Frontend Dev Server
const frontendDev = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], { stdio: 'inherit', shell: true });
frontendDev.on('error', (err) => console.error('Failed to start student frontend dev server:', err));

// 3. Start Admin Frontend Dev Server
const adminFrontendDev = spawn('npm', ['--prefix', 'admin-frontend', 'run', 'dev'], { stdio: 'inherit', shell: true });
adminFrontendDev.on('error', (err) => console.error('Failed to start admin frontend dev server:', err));

// Handle process termination to clean up child processes
process.on('SIGINT', () => {
  emailService.kill();
  frontendDev.kill();
  adminFrontendDev.kill();
  process.exit();
});

process.on('exit', () => {
  emailService.kill();
  frontendDev.kill();
  adminFrontendDev.kill();
});
