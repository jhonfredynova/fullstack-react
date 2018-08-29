import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table } from 'react-bootstrap'
import PropTypes from 'prop-types'
import moment from 'moment'
import NavigationBar from 'components/navigationBar'
import Numeric from 'components/numeric'
import Pager from 'components/pager'
import { set } from 'lodash'
import { hideLoading, showLoading, setMessage, setPreference, PREFERENCE } from 'actions/appActions'
import { getBilling } from 'actions/paymentActions'

class Billing extends Component {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    const { appPreferences } = this.props.app.config
    this.state = {
      billing: this.props.payment.billing,
      billingQuery: {
        pageSize: appPreferences[PREFERENCE.ADMIN_PAGINATION],
        select: ['dateCharge','orderId','amount','currency'],
        sort: [
          { dateCharge: 'DESC' }
        ],
        where: {
          clientCode: session.clientCode,
          orderId: { like: '%' }
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      billing: nextProps.payment.billing
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(getBilling(this.state.billingQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleChangeSearch(data){
    try{
      this.props.dispatch(showLoading())
      await this.props.dispatch(setPreference({ [PREFERENCE.ADMIN_PAGINATION]: data.pageSize }))
      await this.setState({ billingQuery: Object.assign(this.state.billingQuery, data) })
      await this.props.dispatch(getBilling(this.state.billingQuery))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render() {
    const { isLoading } = this.props.app
    const { records } = this.state.billing
    return (
      <div id="subscription">
        <NavigationBar data={{ title: <h1>{this.context.t('billingTitle')}</h1>, subTitle: <h2>{this.context.t('billingDescription')}</h2> }} />
        <Pager isLoading={isLoading} data={this.state.billingQuery} items={this.state.billing} onChange={this.handleChangeSearch.bind(this)}>
          <Table striped condensed hover responsive>
            <thead>
              <tr>
                <th>{this.context.t('date')}</th>
                <th>{this.context.t('referenceId')}</th>
                <th>{this.context.t('amount')}</th>
                <th className="text-center">{this.context.t('options')}</th>
              </tr>
            </thead>
            <tbody>
              {
                records.map((item, index) => 
                  <tr key={index}>
                    <td>{moment(item.dateCharge).format('DD/MM/YYYY')}</td>
                    <td>{item.orderId}</td>
                    <td><Numeric data={{ amount: item.amount, display: 'text', decimalScale: 0, thousandSeparator: ',',  prefix: '$', suffix: ` ${item.currency.toUpperCase()}` }} /> <label className="label label-primary">{item.state}</label></td>
                    <td className="text-center">
                      {
                        <button className="btn btn-success"><i className="glyphicon glyphicon-download-alt"></i></button>
                      }
                    </td>
                  </tr>
                )
              }
            </tbody>
          </Table>
        </Pager>
      </div>
    )
  }
}

Billing.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    payment: state.payment
  }
}

export default connect(mapStateToProps)(Billing)
