import React, { Component } from 'react'
import classnames from 'classnames'
import { defaultTo, range, set } from 'lodash'
import PropTypes from 'prop-types'

class DatePicker extends Component {

  constructor(props) {
    super(props)
    this.state = {
      day: defaultTo(this.props.data.day, null),
      month: defaultTo(this.props.data.month, null),
      year: defaultTo(this.props.data.year, null)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleChangeState(path, value){
    await this.setState(set(this.state, path, value))
    this.props.onChange(this.state)
  }
    
  render() {
    const columnCss = `col-xs-${12/(this.state.day===null ? 2 : 3)}`
    const currentYear = (new Date()).getFullYear()
    return (
      <div id="dataPicker" className="row">
        <div className={classnames({[`${columnCss} noPaddingRight`]: true, 'hide': this.state.day===null })}>
          <select className="form-control">
            <option disabled>{this.context.t('day')}</option>
            {
              range(1,32).map(item => 
                <option key={item} value={item}>{item}</option>
              )
            }
          </select>
        </div>
        <div className={`${columnCss} noPaddingRight`}>
          <select className="form-control">
            <option disabled>{this.context.t('month')}</option>
            {
              range(1,13).map(item => 
                <option key={item} value={item}>{item}</option>
              )
            }
          </select>
        </div>
        <div className={columnCss}>
          <select className="form-control">
            <option disabled>{this.context.t('year')}</option>
            {
              range(currentYear,currentYear+11).map(item => 
                <option key={item} value={item}>{item}</option>
              )
            }
          </select>
        </div>
      </div>
    )
  }
}

DatePicker.contextTypes = {
  t: PropTypes.func.isRequired
}

export default DatePicker
