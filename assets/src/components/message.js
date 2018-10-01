import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { defaultTo } from 'lodash'
import { deleteMessage } from 'actions/appActions'
import Style from 'components/style'

class Message extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      messages: defaultTo(this.props.messages, [])
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleClose(idMessage) {
    this.context.store.dispatch(deleteMessage(idMessage))
  }

  render() {
    const messages = this.state.messages
    return (
      <div id="message">
        {
          messages.map(item =>
            <div key={item.id} className={classnames({ 'alert': true, 'alert-success': item.type==='success', 'alert-danger': item.type==='error', 'alert-warning': item.type==='warning' })}>
              <button className={classnames({ 'close': true, 'd-none': item.hideClose })} onClick={e => this.handleClose(item.id)}>
                <span>&times;</span>
              </button>
              {item.message.toString()}
            </div>
          )
        }
        <Style key="messageStyles">
        {`
          #message {
            position: sticky;
            top: 0px;
            z-index: 1070;
            max-height: 100px;
            overflow: auto;
          }
          #message .alert{
            margin-bottom: 0px;
            border-radius: 0px;
          }
        `}
        </Style>
      </div>
    )
  }
}

Message.contextTypes = {
  store: PropTypes.object.isRequired
}

export default Message