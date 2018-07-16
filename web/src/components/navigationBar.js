import React, { Component } from 'react'
import classnames from 'classnames'
import './navigationBar.css'

class NavigationBar extends Component {

  constructor(props) {
    super(props)
    this.state = {
      title: Object.defaultComponentTo(this.props.data.title, null),
      btnLeft: Object.defaultComponentTo(this.props.data.btnLeft, null),
      btnRight: Object.defaultComponentTo(this.props.data.btnRight, null),
      subTitle: Object.defaultComponentTo(this.props.data.subTitle, null)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  render() {
    return (
      <div id="navigationBar">
        <div className={classnames({'btn-navigation': true, 'hide': !this.state.btnLeft})}>
          {this.state.btnLeft}
        </div>
        <div className="head-navigation text-center">
          {this.state.title}
          {this.state.subTitle}
        </div>
        <div className={classnames({'btn-navigation': true, 'hide': !this.state.btnRight})}>
          {this.state.btnRight}
        </div>
      </div>
    )
  }
}

export default NavigationBar
