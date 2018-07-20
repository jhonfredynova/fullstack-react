import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'
import 'containers/contact.css'

class Contact extends Component {
  render() {
    const { config } = this.props.app
    return (
    	<div id="contact">
        <Seo data={{ title: this.context.t('contactTitle'), description: this.context.t('contactDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('contactTitle')}</h1>, subTitle: <h2>{this.context.t('contactDescription')}</h2> }} />
        <div className="row">		    			
      		<div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
            <h3>
              <i className="fa fa-users fa-2x" aria-hidden="true"></i>
              <a href={config.socialSupportForum} target="_blank" rel="noopener noreferrer">Support</a>
            </h3>
			    </div>
			    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
			      <h3>
              <i className="fa fa-facebook-official fa-2x" aria-hidden="true"></i>
              <a href={config.socialFacebook} target="_blank" rel="noopener noreferrer">Facebook</a>
            </h3>
			    </div>
			    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
			      <h3>
              <i className="fa fa-twitter fa-2x" aria-hidden="true"></i>
              <a href={config.socialTwitter} target="_blank" rel="noopener noreferrer">Twitter</a>
            </h3>
			    </div>
			    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
			      <h3>
              <i className="fa fa-linkedin-square fa-2x" aria-hidden="true"></i>
              <a href={config.socialLinkedin} target="_blank" rel="noopener noreferrer">Linkedin</a>
            </h3>
			    </div>
			    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
			      <h3>
              <i className="fa fa-youtube-play fa-2x" aria-hidden="true"></i>
              <a href={config.socialYoutube} target="_blank" rel="noopener noreferrer">YouTube</a>
            </h3>
			    </div>
			    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-6 text-center">
			      <h3>
              <i className="fa fa-google-plus-official fa-2x" aria-hidden="true"></i>
              <a href={config.socialGoogle} target="_blank" rel="noopener noreferrer">Google Plus</a>
            </h3>
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

