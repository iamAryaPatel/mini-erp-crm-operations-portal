import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';

async function start() {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📋 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
      console.log(`📡 API: http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
