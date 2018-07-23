# Scaffolding fullstack
Based on the following projects:
- [Sails v0.12](http://sailsjs.org) 
- [create-react-app v1.0.10](https://github.com/facebook/create-react-app).

## Running
Configure the environment variables on the following files:
- /.env
- /config/app.js
- /web/.env
Configure database by executing this command:
```
mongorestore -h <dbHost>:<dbPort> -d <dbName> -u <user> -p <password> db/
```
This command will create the following collections:
- catalog
- locale
- plan
- planFeature
- rol
Running application by run this commands:
```
git clone https://github.com/jhonfredynova/scaffolding-fullstack-sails-react
cd scaffolding-fullstack-sails-react
npm i
npm run debug
```
You can check each app on the following urls:
- API: http://localhost:1337/api
- WEB: http://localhost:3000

## Deployment
Before deploying you must configure the environment variables in the server:
```
npm i
npm start
```

## Improvements sailsjs
- Improvements to blueprints
- Payu integration (subscriptions, payments)

## Improvements create-react-app
- Session management
- Redux integration

## Application modules
- Application
  - MultiCallingCodes
  - MultiCurrencies
  - MultiLanguage (EN,ES)
  - Preferences
- Administrator
  - Catalogs
  - Locales
  - Plans
  - Roles
  - Users
- Documents 
  - Docs
  - FAQ
  - Privacy
  - Terms
- Subscription 
  - Billing
  - Prices
  - Subscription
- User
  - Dashboard
  - FogotAccount
  - Login
  - Logout
  - Messages
  - Profile
  - Register
  - ResetPassword
