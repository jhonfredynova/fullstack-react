import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Privacy extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      txtPrivacy: ''
    }
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'id': config.catalogs.txtPrivacy } }))
      await this.setState({ txtPrivacy: get(this.props.catalog.temp, `value[${config.appPreferences.language}]`, '') })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div id="privacy">
        <Seo title={this.context.t('privacyTitle')} description={this.context.t('privacyDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar
          title={<h1>{this.context.t('privacyTitle')}</h1>} 
          description={<h2>{this.context.t('privacyDescription')}</h2>} />
        <article dangerouslySetInnerHTML={{__html: this.state.txtPrivacy}} />
      </div>
    )
  }
}

Privacy.contextTypes = {
  t: PropTypes.func.isRequired
}


function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(Privacy)
