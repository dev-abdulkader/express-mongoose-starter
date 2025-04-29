import { Server } from 'http';
import app from './app';
import config from './config';
import connectDB from './app/db/connect';
// import { initiateSuperAdmin } from './app/db/db';

let server: Server;

// Main function to start the server
async function main() {
  try {
    await connectDB(); 

    // await initiateSuperAdmin();
    server = app.listen(Number(config.port), () => {
      console.log('Server is running on port', config.port);
    });
  } catch (error) {
    console.log(error);
  }
}

// Start the server
main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
