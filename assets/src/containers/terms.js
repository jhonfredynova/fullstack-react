import React, { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Terms extends Component {

  constructor(props) {
    super(props)
    this.state = {
      txtTerms: ''
    }
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'id': config.catalogs.txtTerms } }))
      await this.setState({ txtTerms: get(this.props.catalog.temp, `value[${config.appPreferences.language}]`, '') })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div id="terms">
        <Seo data={{ title: this.context.t('termsTitle'), description: this.context.t('termsDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('termsTitle')}</h1>, subTitle: <h2>{this.context.t('termsDescription')}</h2> }} />
        <article dangerouslySetInnerHTML={{__html: this.state.txtTerms}} />
      </div>
    )
  }
}

Terms.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(Terms)
