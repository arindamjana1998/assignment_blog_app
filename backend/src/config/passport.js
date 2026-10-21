import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import env from './env.js';
import AuthService from '../services/auth.service.js';

export const configurePassport = () => {
  // 1. Google OAuth 2.0 Strategy
  if (
    env.GOOGLE.CLIENT_ID &&
    env.GOOGLE.CLIENT_SECRET &&
    !env.GOOGLE.CLIENT_ID.includes('placeholder')
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE.CLIENT_ID,
          clientSecret: env.GOOGLE.CLIENT_SECRET,
          callbackURL: env.GOOGLE.CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            const user = await AuthService.findOrCreateOAuthUser({
              provider: 'google',
              providerId: profile.id,
              email,
              name: profile.displayName || profile.name?.givenName || 'Google User',
              avatar,
            });
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('[Passport] Google OAuth 2.0 strategy configured successfully');
  } else {
    console.log('[Passport] Google OAuth 2.0 credentials not configured; strategy idle');
  }

  // 2. Facebook OAuth 2.0 Strategy
  if (
    env.FACEBOOK.APP_ID &&
    env.FACEBOOK.APP_SECRET &&
    !env.FACEBOOK.APP_ID.includes('placeholder')
  ) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK.APP_ID,
          clientSecret: env.FACEBOOK.APP_SECRET,
          callbackURL: env.FACEBOOK.CALLBACK_URL,
          profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            const user = await AuthService.findOrCreateOAuthUser({
              provider: 'facebook',
              providerId: profile.id,
              email,
              name: profile.displayName || 'Facebook User',
              avatar,
            });
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('[Passport] Facebook OAuth 2.0 strategy configured successfully');
  } else {
    console.log('[Passport] Facebook OAuth 2.0 credentials not configured; strategy idle');
  }

  return passport;
};

export default configurePassport;
