import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { set } from 'lodash'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import NavigationBar from 'components/navigationBar'
import Seo from 'components/seo'

class BuyResponse extends Component {

  constructor(props) { 
    super(props)
    this.state = {
      title: '',
      message: '',
      thumbnail: ''
    }
  }

  async componentWillMount() {
    try{
      this.props.dispatch(showLoading())
      const params = new URLSearchParams(this.props.location.search)
      const transactionState = params.get('transactionState')
      switch(transactionState){
        case '4':
          this.setState({ 
            title: this.context.t('transactionApprovedTitle'),
            message: this.context.t('transactionApprovedDescription'), 
            thumbnail: 'fa fa-check-square-o fa-2x text-success' 
          })
          break
        case '5':
          this.setState({ 
            title: this.context.t('transactionExpiredTitle'),
            message: this.context.t('transactionExpiredDescription'), 
            thumbnail: 'fa fa-times fa-2x text-danger' 
          })
          break
        case '6':
          this.setState({ 
            title: this.context.t('transactionDeclinedTitle'),
            message: this.context.t('transactionDeclinedDescription'), 
            thumbnail: 'fa fa-ban fa-2x text-danger' 
          })
          break
        case '7':
          this.setState({ 
            title: this.context.t('transactionPendingTitle'),
            message: this.context.t('transactionPendingDescription'), 
            thumbnail: 'fa fa-clock-o fa-2x text-warning' 
          })
          break
        default:
          this.setState({ 
            title: this.context.t('transactionErrorTitle'),
            message: this.context.t('transactionErrorDescription'), 
            thumbnail: 'fa fa-times fa-2x text-danger' 
          })
          break
      }
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value) {
    await this.setState(set(this.state, path, value))
  }

  render() {
    const { isAuthenticated } = this.props.auth
    return (
      <div id="buy">
        <Seo data={{ title: this.state.title, description: this.state.message, siteName: this.context.t('siteName') }} />
        <NavigationBar data={{ title: <h1>{this.state.title}</h1>, subTitle: <h2>{this.state.message}</h2> }} />
        <section className="text-center">
          <h1><i className={this.state.thumbnail} /></h1>
          <p>
            {
              !isAuthenticated ? <Link className="btn btn-success" to="/">{this.context.t('goHomePage')}</Link>
              : <Link className="btn btn-success" to="/app/dashboard">{this.context.t('goToDashboard')}</Link>
            }
          </p>
        </section>
      </div>
    )
  }
}

BuyResponse.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    payment: state.payment,
    plan: state.plan
  }
}

export default connect(mapStateToProps)(BuyResponse)
