import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class ComingSoon extends React.PureComponent {

  render() {
    return (
      <div id="comingSoon">
        <Seo title={this.context.t('comingSoonTitle')} description={this.context.t('comingSoonDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('comingSoonTitle')}</h1>} 
          description={<h2>{this.context.t('comingSoonDescription')}</h2>} />
        <h3 className="text-muted text-center"><i className="fa fa-wrench fa-4x"></i></h3>
      </div>
    )
  }
  
}

ComingSoon.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    app: state.app
  }
}

export default connect(mapStateToProps)(ComingSoon)
