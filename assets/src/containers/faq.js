import React, { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Faq extends Component {

  constructor(props) {
    super(props)
    this.state = {
      txtFaq: ''
    }
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'id': config.catalogs.txtFAQ } }))
      await this.setState({ txtFaq: get(this.props.catalog.temp, `value[${config.appPreferences.language}]`, '') })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div id="faq">
        <Seo data={{ title: this.context.t('faqTitle'), description: this.context.t('faqDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('faqTitle')}</h1>, subTitle: <h2>{this.context.t('faqDescription')}</h2> }} />
        <article dangerouslySetInnerHTML={{__html: this.state.txtFaq}} />
      </div>
    )
  }
}

Faq.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(Faq)
