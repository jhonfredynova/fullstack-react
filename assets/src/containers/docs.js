import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Docs extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      txtDocs: this.props.catalog.catalogs.records
    }
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'id': config.catalogs.txtDocs } }))
      await this.setState({ txtDocs: get(this.props.catalog.temp, `value[${config.appPreferences.language}]`, '') })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    return (
      <div id="docs">
        <Seo title={this.context.t('docsTitle')} description={this.context.t('docsDescription')} siteName={this.context.t('siteName')} />
        <NavigationBar 
          title={<h1>{this.context.t('docsTitle')}</h1>} 
          description={<h2>{this.context.t('docsDescription')}</h2>} />
        <article dangerouslySetInnerHTML={{__html: this.state.txtDocs}} />
      </div>
    )
  }
}

Docs.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    catalog: state.catalog
  }
}

export default connect(mapStateToProps)(Docs)
