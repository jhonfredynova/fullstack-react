import React from 'react'
import { Link } from 'react-router-dom'
import { Nav, Navbar, NavLink, DropdownItem, UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap'
import { includes, isNull } from 'lodash'
import PropTypes from 'prop-types'
import { setMessage, showLoading, hideLoading } from 'actions/appActions'
import { logout } from 'actions/authActions'

class Menu extends React.PureComponent {

  async handleLogout() {
    try {
      this.context.store.dispatch(showLoading())
      const { session } = this.props.auth
      await this.context.store.dispatch(logout(session))
      await this.context.router.history.push('/')
      this.context.store.dispatch(setMessage({ type: 'success', message: this.context.t('sessionFinished') }))
      this.context.store.dispatch(hideLoading())

    }catch(e){
      this.context.store.dispatch(setMessage({ type: 'error', message: e.message }))
      this.context.store.dispatch(hideLoading())
    }
  }

  render() {
    const { session } = this.props.auth
    const currentPath = window.location.pathname
    return (
      <Nav className="ml-auto" navbar>        
        {/* HOME */}
        {
          isNull(session) &&
          <Navbar>
            <NavLink to="/" tag={Link}>{this.context.t('home')}</NavLink>
            <NavLink to="/price" tag={Link}>{this.context.t('price')}</NavLink>
            <NavLink to="/contact" tag={Link}>{this.context.t('contact')}</NavLink>
            <div className="form-inline">
              <button className="btn btn-outline-success ml-2 mr-2" onClick={() => this.context.router.history.push('/login')}>{this.context.t('login')}</button>
              <button className="btn btn-success" onClick={() => this.context.router.history.push('/register')}>{this.context.t('register')}</button>
            </div>
          </Navbar>
        }
        {/* APP */}
        {
          session && includes([2,3,4], session.permissions, false) && 
          <Navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>App</DropdownToggle>
              <DropdownMenu right>
                <DropdownItem active={currentPath==='/app/dashboard'} to="/app/dashboard" tag={Link}>{this.context.t('dashboard')}</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Navbar>
        }
        {/* ADMIN */}
        {
          session && includes([1], session.permissions, true) &&
          <Navbar>   
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>Admin</DropdownToggle>
              <DropdownMenu right>
                <DropdownItem header><i className="fa fa-cogs"></i> CONFIGURATION</DropdownItem>
                <DropdownItem active={currentPath==='/admin/configuration/catalog'} to="/admin/configuration/catalog" tag={Link}>Catalogs</DropdownItem>
                <DropdownItem active={currentPath==='/admin/configuration/locale'} to="/admin/configuration/locale" tag={Link}>Locales</DropdownItem>
                <DropdownItem active={currentPath==='/admin/configuration/plan'} to="/admin/configuration/plan" tag={Link}>Plans</DropdownItem>
                <DropdownItem divider />
                <DropdownItem header><i className="fa fa-cogs"></i> SECURITY</DropdownItem>
                <DropdownItem active={currentPath==='/admin/security/rol'} to="/admin/security/rol" tag={Link}>Roles</DropdownItem>
                <DropdownItem active={currentPath==='/admin/security/user'} to="/admin/security/user" tag={Link}>Users</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Navbar>
        }
        {/* SESSION */}
        {
          session && 
          <Navbar>   
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <span><img src={session.photo} className="img-circle" height="30" alt={session.username} /> {session.username}</span>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem active={currentPath==='/app/user/profile'} to="/app/user/profile" tag={Link}>
                  <i className="fa fa-user"></i> {this.context.t('profile')}
                </DropdownItem>
                <DropdownItem active={currentPath==='/app/user/subscription'} to="/app/user/subscription" tag={Link}>
                  <i className="fa fa-credit-card"></i> {this.context.t('subscription')}
                </DropdownItem>
                <DropdownItem active={currentPath==='/app/user/billing'} to="/app/user/billing" tag={Link}>
                  <i className="far fa-clock"></i> {this.context.t('billing')}
                </DropdownItem>
                <DropdownItem onClick={this.handleLogout.bind(this)}>
                  <i className="fa fa-key"></i> {this.context.t('logout')}
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Navbar>   
        }
      </Nav>
    )
  }
}

Menu.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default Menu
