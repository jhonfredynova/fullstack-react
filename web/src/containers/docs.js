import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { get } from 'lodash'
import { getCatalog } from 'actions/catalogActions'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class Docs extends Component {

  constructor(props) {
    super(props)
    this.state = {
      docs: this.props.catalog.catalogs.records
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      docs: nextProps.catalog.catalogs.records
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      const { config } = this.props.app
      await this.props.dispatch(getCatalog({ where: { 'parent': config.catalogTxtDocs } }))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { appPreferences } = this.props.app.config
    return (
      <div id="docs">
        <Seo data={{ title: this.context.t('docsTitle'), description: this.context.t('docsDescription'), siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.context.t('docsTitle')}</h1>, subTitle: <h2>{this.context.t('docsDescription')}</h2> }} />
        <section className="row">
          {
            this.state.docs.map(item => {
              return (
                <div key={item.id} className="col-md-6">
                  <h2 className="text-center" dangerouslySetInnerHTML={{__html: item.name}}></h2>
                  <article dangerouslySetInnerHTML={{__html: get(item, `value[${appPreferences.language}]`, '')}} />
                  <div className="embed-responsive embed-responsive-16by9">
                    <iframe title={item.name} className="embed-responsive-item" src={item.thumbnail}></iframe>
                  </div>
                </div>
              )
            })
          }
        </section>
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
