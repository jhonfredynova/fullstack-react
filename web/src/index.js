import React from 'react'
import { render } from 'react-snapshot'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import I18n from "redux-i18n"
import { Provider } from "react-redux"
import Store from "./store"
import RegisterServiceWorker from './registerServiceWorker'
import { PERMISSION } from 'actions/authActions'
import 'components/polyfill'
//CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-social/bootstrap-social.css'
import 'react-input-range/lib/bundle/react-input-range.css'
import 'react-loading-bar/dist/index.css'
import 'react-select/dist/react-select.css'
import 'react-quill/dist/quill.snow.css'
import 'font-awesome/css/font-awesome.css'
//ADMIN-CONTAINERS
import AdminCatalog from 'containers/admin/configuration/adminCatalog'
import AdminCatalogSave from 'containers/admin/configuration/adminCatalogSave'
import AdminLocale from 'containers/admin/configuration/adminLocale'
import AdminLocaleSave from 'containers/admin/configuration/adminLocaleSave'
import AdminPlan from 'containers/admin/configuration/adminPlan'
import AdminPlanSave from 'containers/admin/configuration/adminPlanSave'
import AdminPlanFeature from 'containers/admin/configuration/adminPlanFeature'
import AdminPlanFeatureSave from 'containers/admin/configuration/adminPlanFeatureSave'
import AdminRol from 'containers/admin/security/adminRol'
import AdminRolSave from 'containers/admin/security/adminRolSave'
import AdminUser from 'containers/admin/security/adminUser'
import AdminUserSave from 'containers/admin/security/adminUserSave'
import AdminUserRol from 'containers/admin/security/adminUserRol'
import AdminUserRolSave from 'containers/admin/security/adminUserRolSave'
//APP-CONTAINERS
import Dashboard from 'containers/app/dashboard'
import Profile from 'containers/app/user/profile'
import Subscription from 'containers/app/user/subscription'
import Billing from 'containers/app/user/billing'
//HOME-CONTAINERS
import Main from 'containers/main'
import Authorization from 'containers/authorization'
import Buy from 'containers/buy'
import Contact from 'containers/contact'
import ComingSoon from 'containers/comingSoon'
import Docs from 'containers/docs'
import Faq from 'containers/faq'
import ForgotAccount from 'containers/forgotAccount'
import Home from 'containers/home'
import Login from 'containers/login'
import Price from 'containers/price'
import Privacy from 'containers/privacy'
import ResetAccount from 'containers/resetAccount'
import Register from 'containers/register'
import RegisterConfirm from 'containers/registerConfirm'
import Terms from 'containers/terms'
import NotFound from 'components/notFound'
//RENDER
const { ROL_ADMIN, ROL_REGISTERED } = PERMISSION
render((
  <Provider store={Store}>
    <I18n translations={{}} initialLang={'en'} fallbackLang={'en'} useReducer={true}>
      <BrowserRouter>
        <Main>
          <Switch>
            {/* ADMIN */}
            {/* CONFIGURATION */}
            <Route path="/admin/configuration/catalog" exact component={Authorization(AdminCatalog,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/catalog/new" component={Authorization(AdminCatalogSave,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/catalog/:id" component={Authorization(AdminCatalogSave,[ROL_ADMIN])}/> 
            <Route path="/admin/configuration/locale" exact component={Authorization(AdminLocale,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/locale/new" component={Authorization(AdminLocaleSave,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/locale/:id" component={Authorization(AdminLocaleSave,[ROL_ADMIN])}/> 
            <Route path="/admin/configuration/plan" exact component={Authorization(AdminPlan,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/plan/new" component={Authorization(AdminPlanSave,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/plan/:id/feature" exact component={Authorization(AdminPlanFeature,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/plan/:id/feature/new" component={Authorization(AdminPlanFeatureSave,[ROL_ADMIN])}/>
            <Route path="/admin/configuration/plan/:id/feature/:idFeature" component={Authorization(AdminPlanFeatureSave,[ROL_ADMIN])}/> 
            <Route path="/admin/configuration/plan/:id" component={Authorization(AdminPlanSave,[ROL_ADMIN])}/> 
            {/* SECURITY */}
            <Route path="/admin/security/user" exact component={Authorization(AdminUser,[ROL_ADMIN])}/>
            <Route path="/admin/security/user/new" component={Authorization(AdminUserSave,[ROL_ADMIN])}/>
            <Route path="/admin/security/user/:id/rol" exact component={Authorization(AdminUserRol,[ROL_ADMIN])}/>
            <Route path="/admin/security/user/:id/rol/new" exact component={Authorization(AdminUserRolSave,[ROL_ADMIN])}/>
            <Route path="/admin/security/user/:id" component={Authorization(AdminUserSave,[ROL_ADMIN])}/>  
            <Route path="/admin/security/rol" exact component={Authorization(AdminRol,[ROL_ADMIN])}/>
            <Route path="/admin/security/rol/new" component={Authorization(AdminRolSave,[ROL_ADMIN])}/>
            <Route path="/admin/security/rol/:id" component={Authorization(AdminRolSave,[ROL_ADMIN])}/>    
            {/* APP */}
            {/* USER */}
            <Route path="/app/dashboard" component={Authorization(Dashboard,[ROL_REGISTERED])}/>
            <Route path="/app/user/profile" component={Authorization(Profile,[ROL_REGISTERED])}/>   
            <Route path="/app/user/subscription" component={Authorization(Subscription,[ROL_REGISTERED])}/>
            <Route path="/app/user/billing" component={Authorization(Billing,[ROL_REGISTERED])}/>
            {/* HOME */}
            <Route path="/" exact component={Home}/>
            <Route path="/buy/:idPlan" exact component={Buy}/>
            <Route path="/contact" component={Contact}/>
            <Route path="/coming-soon" component={ComingSoon}/>
            <Route path="/docs" component={Docs}/>
            <Route path="/forgot-Account" component={ForgotAccount}/>
            <Route path="/faq" component={Faq}/>
            <Route path="/login" exact component={Login}/>
            <Route path="/login/:provider?/:token?" component={Login}/>
            <Route path="/price" component={Price}/>
            <Route path="/privacy" component={Privacy}/>
            <Route path="/register" exact component={Register}/>
            <Route path="/register/confirm/:token" component={RegisterConfirm}/>
            <Route path="/reset-account/:token" component={ResetAccount}/>
            <Route path="/terms" component={Terms}/>
          </Switch>
        </Main>
      </BrowserRouter>
    </I18n>
  </Provider>
), document.getElementById('root'))

RegisterServiceWorker()
