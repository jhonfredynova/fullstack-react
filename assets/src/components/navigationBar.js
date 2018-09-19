import React from 'react'
import classnames from 'classnames'
import { defaultTo } from 'lodash'
import { Style } from 'react-style-tag'

class NavigationBar extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      title: defaultTo(this.props.title, null),
      description: defaultTo(this.props.description, null),
      btnLeft: defaultTo(this.props.btnLeft, null),
      btnRight: defaultTo(this.props.btnRight, null)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  render() {
    return (
      <div id="navigationBar" className="border-bottom">
        <div className={classnames({'btn-navigation': true, 'd-none': !this.state.btnLeft})}>
          {this.state.btnLeft}
        </div>
        <div className="head-navigation text-center">
          {this.state.title}
          {this.state.description}
        </div>
        <div className={classnames({'btn-navigation': true, 'd-none': !this.state.btnRight})}>
          {this.state.btnRight}
        </div>
        <Style>
        {`
          #navigationBar{
            display: table;
            margin-bottom: 20px;
            width: 100%;
          }
          #navigationBar .btn-navigation,
          #navigationBar .head-navigation{
            display: table-cell;
            vertical-align: middle;
          }
          #navigationBar .btn-navigation{
            width: 50px;
            font-weight: normal;
            cursor: pointer;
          }
          #navigationBar .head-navigation h1,
          #navigationBar .head-navigation h2{
            margin-top: 10px;
          }
          #navigationBar .head-navigation h2{
            color: gray;
            font-weight: normal;
            font-size: 14px;
          } 
        `}
        </Style>
      </div>
    )
  }
}

export default NavigationBar
