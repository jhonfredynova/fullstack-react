import  React, { Component } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Button, Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { includes } from 'lodash'
import PropTypes from 'prop-types'
import { setMessage } from 'actions/appActions'
import { logout } from 'actions/authActions'
import './menu.css'


class Menu extends Component {

  async handleLogout() {
    try {
      await this.context.store.dispatch(logout())
      await this.context.router.history.push('/')
      this.context.store.dispatch(setMessage({ type: 'success', message: this.context.t('sessionFinished') }))
    }catch(e){
      this.context.store.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  render() {
    const { isAuthenticated, session } = this.props.data.auth
    return (
      <div id="menu" className={this.props.className}>
        {/* SESSION */}
        {
          isAuthenticated ? 
          <Nav pullRight>   
            <NavDropdown className="navItemWithImg" id="navSession" title={<span><img src={session.photo} className="img-circle" height="30" alt={session.username} /> {session.username}</span>}>
              <LinkContainer to="/app/user/profile">
                <MenuItem><i className="fa fa-user"></i> {this.context.t('profile')}</MenuItem>
              </LinkContainer>
              <LinkContainer to="/app/user/subscription">
                <MenuItem><i className="fa fa-credit-card"></i> {this.context.t('subscription')}</MenuItem>
              </LinkContainer>
              <LinkContainer to="/app/user/billing">
                <MenuItem><i className="glyphicon glyphicon-time"></i> {this.context.t('billing')}</MenuItem>
              </LinkContainer>
              <MenuItem onClick={this.handleLogout.bind(this)}><i className="fa fa-key"></i> {this.context.t('logout')}</MenuItem>
            </NavDropdown>
          </Nav>
          : null
        }
        {/* ADMIN */}
        {
          isAuthenticated && includes([1], session.permissions, true) ? 
          <Nav pullRight>   
            <NavDropdown id="navAdmin" title="Admin">
              <MenuItem header><i className="fa fa-cogs"></i> CONFIGURATION</MenuItem>
              <LinkContainer to="/admin/configuration/catalog">
                <MenuItem>Catalogs</MenuItem>
              </LinkContainer>
              <LinkContainer to="/admin/configuration/locale">
                <MenuItem>Locales</MenuItem>
              </LinkContainer>
              <LinkContainer to="/admin/configuration/plan">
                <MenuItem>Plans</MenuItem>
              </LinkContainer>
              <MenuItem divider />
              <MenuItem header><i className="fa fa-cogs"></i> SECURITY</MenuItem>
              <LinkContainer to="/admin/security/rol">
                <MenuItem>Roles</MenuItem>
              </LinkContainer>
              <LinkContainer exact to="/admin/security/user">
                <MenuItem>Users</MenuItem>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          : null
        }
        {/* APP */}
        {
          isAuthenticated && includes([2,3,4], session.permissions, false) ? 
          <Nav pullRight>
            <LinkContainer exact to="/">
              <NavItem>{this.context.t('home')}</NavItem>
            </LinkContainer>
            <NavDropdown id="navApp" title="App">
              <LinkContainer to="/app/dashboard">
                <MenuItem>{this.context.t('dashboard')}</MenuItem>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          : null
        }
        {/* HOME */}
        {
          isAuthenticated===false ?
          <Navbar.Form pullRight>
            <LinkContainer to="/login">
              <Button className="btn btn-default">{this.context.t('login')}</Button>
            </LinkContainer>
            <LinkContainer to="/register">
              <Button className="btn btn-success">{this.context.t('register')}</Button>
            </LinkContainer>
          </Navbar.Form>
          : null
        }
        {
          isAuthenticated===false ? 
          <Nav pullRight> 
            <LinkContainer exact to="/">
              <NavItem>{this.context.t('home')}</NavItem>
            </LinkContainer>
            <LinkContainer to="/price">
              <NavItem>{this.context.t('price')}</NavItem>
            </LinkContainer>
            <LinkContainer to="/contact">
              <NavItem>{this.context.t('contact')}</NavItem>
            </LinkContainer>
          </Nav>
          : null
        }
      </div>
    )
  }
}

Menu.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default Menu
