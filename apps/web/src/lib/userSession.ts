import { AppConfig, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function getUserData() {
  return userSession.isUserSignedIn() ? userSession.loadUserData() : null;
}

export function isSignedIn() {
  return userSession.isUserSignedIn();
}
