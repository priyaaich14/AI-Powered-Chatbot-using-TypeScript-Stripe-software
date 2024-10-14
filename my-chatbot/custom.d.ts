// src/custom.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_STRIPE_PUBLISHABLE_KEY: string;
      // Add other environment variables you are using
        

      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
  