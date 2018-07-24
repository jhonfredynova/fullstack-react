import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get, filter } from 'lodash'
import classnames from 'classnames'
import { Navbar, MenuItem, Popover, OverlayTrigger, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { setLanguage } from 'redux-i18n'
import { hideLoading, showLoading, getConfig, setMessage, setPreference, PREFERENCE  } from 'actions/appActions'
import Menu from 'components/menu'
import './header.css'

class Header extends Component {

  async handleChangeCurrency(currency) {
    try{
      this.context.store.dispatch(showLoading())
      await this.context.store.dispatch(getConfig({ baseCurrency: currency }))
      await this.context.store.dispatch(setPreference({ [PREFERENCE.CURRENCY]: currency }))
      this.context.store.dispatch(hideLoading())
    }catch(e){
      this.context.store.dispatch(setMessage({ type: 'error', message: e.message }))
      this.context.store.dispatch(hideLoading())
    }
  }

  async handleChangeLanguage(language) {
    try{
      this.context.store.dispatch(showLoading())
      await this.context.store.dispatch(setPreference({ [PREFERENCE.LANGUAGE]: language }))
      await this.context.store.dispatch(setLanguage(language))
      this.context.store.dispatch(hideLoading())
    }catch(e){
      this.context.store.dispatch(setMessage({ type: 'error', message: e.message }))
      this.context.store.dispatch(hideLoading())
    }
  }

  render() {
    const { appLoaded } = this.props.data
    const { config } = this.props.data.app
    const { isAuthenticated } = this.props.data.auth
    const { appPreferences } = config
    const currencies = get(config.appIntl, 'currencies', [])
    const languages = filter(get(config.appIntl, 'languages', []), item => config.appLanguages.indexOf(item.value)>-1)
    const popoverMessages = (
      <Popover id="popover-trigger-click-root-close" title={this.context.t('messages')}>
        <p>{this.context.t('userNotHaveMessages')}</p>
      </Popover>
    )
    const popoverNotifications = (
      <Popover id="popover-trigger-click-root-close" title={this.context.t('notifications')}>
        <p>{this.context.t('userNotHaveNotifications')}</p>
      </Popover>
    )
    const popoverPreferences = (
      <Popover id="popover-trigger-click-root-close" title={this.context.t('preferences')}>
        <div className="form-group">
          <label>{this.context.t('language')}</label>
          <Select placeholder='Select...' options={languages} optionRenderer={option => option.label} valueRenderer={option => option.label} simpleValue={true} value={get(appPreferences, 'language', '')} clearable={false} autosize={false} onChange={value => this.handleChangeLanguage(value)} />
        </div>
        <div className="form-group">
          <label>{this.context.t('currency')}</label>
          <Select placeholder='Select...' options={currencies} optionRenderer={option => option.label} valueRenderer={option => option.label} simpleValue={true} value={get(appPreferences, 'currency', '')} clearable={false} autosize={false} onChange={value => this.handleChangeCurrency(value)} />
        </div>
      </Popover>
    )
    return (
      <header>
        <Navbar fluid>
          <div className="navbar-header">
            {/* BRAND */}
            <Navbar.Brand>
              <Link to="/">
                <img src={config.appLogo} alt={config.appName} /> <span>{config.appName}</span>
              </Link>
            </Navbar.Brand> 
            {/* TOGGLE */}
            <Navbar.Toggle className={classnames({'hide': (!appLoaded || config.appDisabled) })} />
            {/* OPTIONS */}
            <ul className={classnames({'navbar-btn navbar-right navbar-options': true, 'hide': (!appLoaded || config.appDisabled) })}>
              <MenuItem>
                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popoverNotifications}>
                  <Button className="btn btn-success btn-block"><i className="glyphicon glyphicon-bell"></i></Button>
                </OverlayTrigger>
              </MenuItem>
              <MenuItem className={classnames({'hide': !isAuthenticated})}>
                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popoverMessages}>
                  <Button className="btn btn-success btn-block"><i className="glyphicon glyphicon-comment"></i></Button>
                </OverlayTrigger>
              </MenuItem>
              <MenuItem>
                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popoverPreferences}>
                  <Button className="btn btn-success btn-block"><i className="glyphicon glyphicon-cog"></i></Button>
                </OverlayTrigger>
              </MenuItem>
            </ul>
          </div>
          {/* MENU */}
          <Navbar.Collapse>
            <Menu className={classnames({'hide': (!appLoaded || config.appDisabled) })} data={{ app: this.props.data.app, auth: this.props.data.auth }} />
          </Navbar.Collapse>
        </Navbar>
      </header>
    )
  }
}

Header.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default Header
