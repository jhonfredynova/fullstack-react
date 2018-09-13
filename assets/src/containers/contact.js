import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Contact extends React.PureComponent {
  render() {
    const { appName, social } = this.props.app.config
    return (
    	<div id="contact">
        <Seo title={this.context.t('contactTitle')} description={this.context.t('contactDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('contactTitle')}</h1>} 
          description={<h2>{this.context.t('contactDescription')}</h2>} />
        <div className="row">		    			
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>Support</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fa fa-users fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.supportForum} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>Facebook</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fab fa-facebook fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.facebook} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>Twitter</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fab fa-twitter fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.twitter} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>LinkedIn</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fab fa-linkedin fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>Youtube</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fab fa-youtube fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.youtube} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
          <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-4 text-center">
            <h3>Google plus</h3>
            <p className="d-flex align-items-center justify-content-center">
              <i className="fab fa-google-plus fa-2x pr-1" aria-hidden="true"></i>
              <a href={social.google} target="_blank" rel="noopener noreferrer">{appName}</a>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

Contact.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth
  }
}

export default connect(mapStateToProps)(Contact)

