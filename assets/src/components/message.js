import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { defaultTo } from 'lodash'
import { deleteMessage } from 'actions/appActions'
import './message.css'

class Message extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      messages: defaultTo(this.props.data.messages, [])
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.data)
  }

  async handleClose(idMessage) {
    this.context.store.dispatch(deleteMessage(idMessage))
  }

  render() {
    const messages = this.state.messages
    const { isLoading } = this.props.data
    return (
      <div id="message" className={classnames({'hide': (isLoading || messages.length===0)})}>
        {
          messages.map(item =>
            <div key={item.id} className={classnames({ 'alert': true, 'alert-success': item.type==='success', 'alert-danger': item.type==='error', 'alert-warning': item.type==='warning' })}>
              <button className={classnames({ 'close': true, 'hide': item.hideClose })} onClick={e => this.handleClose(item.id)}>
                <span>&times;</span>
              </button>
              {item.message.toString()}
            </div>
          )
        }
      </div>
    )
  }
}

Message.contextTypes = {
  store: PropTypes.object.isRequired
}

export default Message
