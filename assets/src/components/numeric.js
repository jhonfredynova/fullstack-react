import React from 'react'
import NumberFormat from 'react-number-format'
import { defaultTo, set, isEmpty } from 'lodash'

class Numeric extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      amount: defaultTo(this.props.amount, ''),
      decimalScale: defaultTo(this.props.decimalScale, 0),
      decimalSeparator: defaultTo(this.props.decimalSeparator, '.'),
      display: defaultTo(this.props.display, 'input'),
      format: defaultTo(this.props.format, null),
      from: defaultTo(this.props.from, null),
      placeholder: defaultTo(this.props.placeholder, ''),
      prefix: defaultTo(this.props.prefix, ''),
      currencyConversion: defaultTo(this.props.currencyConversion, []),
      suffix: defaultTo(this.props.suffix, ''),
      thousandSeparator: defaultTo(this.props.thousandSeparator, ''),
      to: defaultTo(this.props.to, null)
    }
  }

  async componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
    this.props.onChange(this.state.amount)
  }

  render() {
    let amount = this.state.amount
    if(!isEmpty(this.state.currencyConversion) && this.state.to){
      amount = this.state.amount/this.state.currencyConversion[this.state.to.toUpperCase()]
      amount = isNaN(amount) ? this.state.amount : amount
    }
    return (
      <NumberFormat className={this.props.className} decimalScale={this.state.decimalScale} format={this.state.format} placeholder={this.state.placeholder} allowEmptyFormatting={false} value={amount} displayType={this.state.display} prefix={this.state.prefix} suffix={this.state.suffix} thousandSeparator={this.state.thousandSeparator} decimalSeparator={this.state.decimalSeparator} onValueChange={value => this.handleChangeState('amount', (isNaN(value.floatValue) ? '' : value.floatValue))} />
    )
  }
}

export default Numeric
