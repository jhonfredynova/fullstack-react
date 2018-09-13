import  React from 'react'
import { Tooltip } from 'reactstrap'
import classnames from 'classnames'
import { defaultTo, get, set, sortBy } from 'lodash'
import Numeric from 'components/numeric'
import PropTypes from 'prop-types' 
import { Style } from 'react-style-tag'

class PlanBox extends React.PureComponent {

  constructor(props){
    super(props)
    this.state = {
      info: defaultTo(this.props.info, {}),
      popular: defaultTo(this.props.popular, null),
      selected: defaultTo(this.props.selected, null),
      showTooltipPlanFree: false
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
  }

  async handleClick(){
    if(this.props.onClick){
      this.props.onClick()
    }
  }

  render() {
    const { isLoading } = this.props
    const { config } = this.props.app
    const { plans } = config
    let { info } = this.state
    info.popular = info.id===this.state.popular
    info.selected = info.id===this.state.selected
    info.price = { value: 0, recurrence: '' }
    if(info.paymentType==='subscription'){
      info.price = get(info, 'subscriptionInfo.price', {})
      info.price.recurrence = `/${this.context.t('month')}`
    }
    if(info.paymentType==='transaction'){
      info.price = get(info, 'transactionValue', {})
      info.price.recurrence = ''
    }
    return (
      <div id="planBox" className={classnames({'popular': info.popular, 'selected': info.selected, 'hide': isLoading})} onClick={this.handleClick.bind(this)}>
        <div id={`plan-${info.id}`} className="card" onClick={() => this.handleChangeState('showTooltipPlanFree', !this.state.showTooltipPlanFree)}>
          <div className="card-header text-center">
            <div id="popular" className={classnames({'d-none': !info.popular})}>
              <i className="fas fa-star"></i>
            </div>
            <div id="selected" className={classnames({'d-none': !info.selected})}>
              <i className="fas fa-check-circle"></i>
            </div>
            {info.name}
            <div className="paymentInfo">
              <div className="d-inline text-danger small">
                <Numeric amount={info.price.value} display='text' decimalScale={2} from={config.appPreferences.currency} to={info.price.currency} prefix='$' suffix={` ${config.appPreferences.currency.toUpperCase()}${info.price.recurrence}`} currencyConversion={config.appIntl.currencyConversion} thousandSeparator=',' />
              </div>  
            </div>
          </div>
          <div className="card-body">
            <ul className="list-unstyled">
              {
                sortBy(info.features, ['order']).map(item => 
                  <li key={item.id} className={classnames({'text-deleted text-danger': item.quantity===0})}>
                    <i className={item.feature.icon} /> {item.feature.name}
                  </li>
                )
              }
            </ul>
          </div>
          { info.id===plans.free && 
            <Tooltip target={`plan-${info.id}`} placement="top" isOpen={this.state.showTooltipPlanFree} toggle={() => this.handleChangeState('showTooltipPlanFree', !this.state.showTooltipPlanFree)}>
              {this.context.t('subscriptionPlanFree')}
            </Tooltip>
          }
        </div>
        <Style>
        {`
          #planBox:not(.selected) {
            cursor: pointer;
          }
          #planBox.selected,
          #planBox:focus,
          #planBox:hover{
            box-shadow: 1px 1px 5px #999;
          }
          #planBox h1,
          #planBox h2{
            margin-top: 5px;
            margin-bottom: 5px;
          }
          #planBox .paymentInfo{
            line-height: 35px;
          }
          /* popular */
          #planBox.popular .card-header{
            background-color: #dff0d8;
          }
          #planBox.popular .card-header > #popular{
            background-color: #fc9b30;
            border-color: #fc9b30;
            color: white;
            text-align: center;
            font-style: italic;
            font-size: 12px;
            font-family: "Comic Sans MS", "Comic Sans", cursive;
            position: absolute;
            padding: 5px 8px;
            right: 5px;
            top: -10px;
            border-radius: 15px;
          }
          #planBox.popular .card-body{
            background-color: #ffc;
          }
          /* selected */
          #planBox.selected .card-header{
            background-color: #dff0d8;
          }
          #planBox.selected .card-header > #selected{
            background-color: #5cb85c;
            border-color: #4cae4c;
            color: white;
            text-align: center;
            font-style: italic;
            font-size: 12px;
            font-family: "Comic Sans MS", "Comic Sans", cursive;
            position: absolute;
            padding: 5px 8px;
            right: 5px;
            top: -10px;
            border-radius: 15px;
          } 
        `}
        </Style>
      </div>
    )
  }
}

PlanBox.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default PlanBox
