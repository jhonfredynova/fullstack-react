import React from 'react'
import PropTypes from 'prop-types'
import { get, set, filter } from 'lodash'
import classnames from 'classnames'
import { Collapse, Navbar, NavbarBrand, NavbarToggler, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { setLanguage } from 'redux-i18n'
import { hideLoading, showLoading, getConfig, setMessage, setPreference, PREFERENCE  } from 'actions/appActions'
import Menu from 'components/menu'

class Header extends React.PureComponent {

  constructor(props){
    super(props)
    this.state = {
      showMenu: false,
      showPopoverMessages: false,
      showPopoverNotifications: false,
      showPopoverPreferences: false
    }
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
  }

  async handleChangeCurrency(currency) {
    try{
      this.context.store.dispatch(showLoading())
      await this.context.store.dispatch(setPreference({ [PREFERENCE.CURRENCY]: currency }))
      await this.context.store.dispatch(getConfig())
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
    const { config } = this.props.app
    const { session } = this.props.auth
    const { appDisabled, appPreferences } = config
    const currencies = get(config.appIntl, 'currencies', [])
    const languages = filter(get(config.appIntl, 'languages', []), item => config.appLanguages.indexOf(item.value)>-1)
    return (
      <header>
        <Navbar className="border-bottom" color="light" light expand="md">
          <NavbarBrand to="/" tag={Link}>
            <img src={config.appLogo} alt={config.appName} width={35} /> <span>{config.appName}</span>
          </NavbarBrand> 
          <Navbar className={classnames({'ml-auto': true, 'd-none': appDisabled })}>
            <div className="form-inline">
              {/* PREFERENCES */}
              <button id="popoverPreferences" className="btn btn-success mr-1" onClick={() => this.handleChangeState('showPopoverPreferences', !this.state.showPopoverPreferences)}><i className="fas fa-cog"></i></button>
              <Popover target="popoverPreferences" placement="bottom" isOpen={this.state.showPopoverPreferences} toggle={() => this.handleChangeState('showPopoverPreferences', !this.state.showPopoverPreferences)}>
                <PopoverHeader>{this.context.t('preferences')}</PopoverHeader>
                <PopoverBody>
                  <div className="form-group">
                    <label>{this.context.t('language')}</label>
                    <Select placeholder='Select...' options={languages} optionRenderer={option => option.label} valueRenderer={option => option.label} simpleValue={true} value={get(appPreferences, 'language', '')} clearable={false} autosize={false} onChange={value => this.handleChangeLanguage(value)} />
                  </div>
                  <div className="form-group">
                    <label>{this.context.t('currency')}</label>
                    <Select placeholder='Select...' options={currencies} optionRenderer={option => option.label} valueRenderer={option => option.label} simpleValue={true} value={get(appPreferences, 'currency', '')} clearable={false} autosize={false} onChange={value => this.handleChangeCurrency(value)} />
                  </div>
                </PopoverBody>
              </Popover>
              {/* MESSAGES */}
              <button id="popoverMessages" className={classnames({"btn btn-success mr-1": true, 'd-none': !session})} onClick={() => this.handleChangeState('showPopoverMessages', !this.state.showPopoverMessages)}><i className="fas fa-comment-alt"></i></button>
              <Popover target="popoverMessages" placement="bottom" isOpen={this.state.showPopoverMessages} toggle={() => this.handleChangeState('showPopoverMessages', !this.state.showPopoverMessages)}>
                <PopoverHeader>{this.context.t('messages')}</PopoverHeader>
                <PopoverBody>
                  <p>{this.context.t('userNotHaveMessages')}</p>
                  <hr className="mb-2" />
                  <div className="text-center"><Link to="/app/user/chat">{this.context.t('seeAll')}</Link></div>
                </PopoverBody>
              </Popover>
              {/* NOTIFICATIONS */}
              <button id="popoverNotifications" className="btn btn-success mr-1" onClick={() => this.handleChangeState('showPopoverNotifications', !this.state.showPopoverNotifications)}><i className="fas fa-bell"></i></button>              
              <Popover target="popoverNotifications" placement="bottom" isOpen={this.state.showPopoverNotifications} toggle={() => this.handleChangeState('showPopoverNotifications', !this.state.showPopoverNotifications)}>
                <PopoverHeader>{this.context.t('notifications')}</PopoverHeader>
                <PopoverBody>
                  <p>{this.context.t('userNotHaveNotifications')}</p>
                </PopoverBody>
              </Popover>
            </div>
          </Navbar>
          <NavbarToggler className={classnames({'d-none': appDisabled })} onClick={() => this.handleChangeState('showMenu',!this.state.showMenu)} />
          <Collapse isOpen={this.state.showMenu} navbar>
            { !appDisabled && <Menu app={this.props.app} auth={this.props.auth} /> }
          </Collapse>
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
