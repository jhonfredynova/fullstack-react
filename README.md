# Scaffolding fullstack

Based on the projects [Sails](http://sailsjs.org) and [create-react-app](https://github.com/facebook/create-react-app).

## Running

Before running you must configure the environment vars on the following files:
- /.env
- /config/app.js
- /web/.env

```
git clone https://github.com/jhonfredynova/scaffolding-fullstack-sails-react
cd scaffolding-fullstack-sails-react
npm i
npm start
```
You can check each app on the following urls:
- API: http://localhost:1337/api
- WEB: http://localhost:3000

## Sailsjs additions
- Improvements to blueprints
- Payu integration (subscriptions, payments)

## create-react-app additions
- Session management
- Redux integration

## Application modules
- App module (MultiCallingCodes, MultiCurrencies, MultiLanguage)
- Admin module (Catalogs, Locales, Plans, Roles, Users)
- Docs module (Docs, FAQ, Privacy, Terms)
- Subscription module (Billing, Prices, Subscription)
- User module (FogotAccount, Login, Register, ResetPassword)
- Session module (Dashboard, Logout, Profile)
