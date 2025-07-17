// app/config/env.ts
import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_BASE_URL: 'http://localhost:3000/api',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.marketplace.com/api',
  },
  prod: {
    API_BASE_URL: 'https://api.marketplace.com/api',
  },
};

function getEnvVars(env = '') {
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  } else {
    return ENV.prod;
  }
}

export default getEnvVars(Constants.expoConfig?.releaseChannel);