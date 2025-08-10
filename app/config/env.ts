// app/config/env.ts
import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_BASE_URL: 'http://localhost:3000/api',
    YANDEX_MAPS_API_KEY: process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    MAPS_PROVIDER: process.env.EXPO_PUBLIC_MAPS_PROVIDER || 'yandex',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.marketplace.com/api',
    YANDEX_MAPS_API_KEY: process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    MAPS_PROVIDER: process.env.EXPO_PUBLIC_MAPS_PROVIDER || 'yandex',
  },
  prod: {
    API_BASE_URL: 'https://api.marketplace.com/api',
    YANDEX_MAPS_API_KEY: process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    MAPS_PROVIDER: process.env.EXPO_PUBLIC_MAPS_PROVIDER || 'yandex',
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