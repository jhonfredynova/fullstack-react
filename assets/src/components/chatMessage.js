import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo, isEmpty, set, clean, compact, get } from 'lodash'
import { setMessage } from 'actions/appActions'
import { Style } from 'react-style-tag'

class ChatMessage extends React.PureComponent {

  constructor(props) {
    super(props)
    this.state = { 
      errors: {},
      messages: defaultTo(this.props.messages, []) 
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleValidate(path){
    let errors = clean(this.state.errors)
    if(isEmpty(this.state.value)) {
      errors.value = this.context.t('enterMessage')
    }
    if(path) errors = set(this.state.errors, path, get(errors, path))
    await this.setState({ errors: errors })
  }

  async handleSendMessage(e){
    try{
      if(e) e.preventDefault()
      //validate
      await this.handleValidate()
      if(!compact(this.state.errors)){
        this.context.store.dispatch(setMessage({ type: 'error', message: this.context.t('formErrors') }))
        return
      }
      //execute
      if(this.props.onSend) this.props.onSend(this.state)
    }catch(e){
      this.context.store.dispatch(setMessage({ type: 'error', message: e.message }))
    }
  }

  render() {
    const { messages } = this.state
    const { isLoading, className } = this.props
    return (
      <div id="chatMessage" className={className}>
        <div className="messageWrap">
          { !isLoading && messages.length===0 &&
            <div>
              <h2 className="text-center"><i className="fa fa-comments fa-2x" /></h2>
              <p className="text-center">{this.context.t('chatEmpty')}</p>
            </div>
          }
          {
            messages.map(item => 
              <div key={item.id} className="d-flex flex-row">
                <div className="alert alert-primary">{item.value}</div>
              </div>
            )
          }
        </div>
        <form onSubmit={this.handleSendMessage.bind(this)}>
          <div className="input-group">
            <input type="text" className="form-control" />
            <div className="input-group-append">
              <button type="submit" className="btn btn-success">{this.context.t('send')}</button>
            </div>
          </div>
        </form>
        <Style>
        {`
          #chatMessage{
            overflow: hidden;
            height: 100%;
          }
          #chatMessage .messageWrap{
            height: 74%;
            overflow: auto;
          }
          #chatMessage .messageWrap h2{
            margin-top: 0px;
          }
          #chatMessage .messageWrap .alert{
            max-width: 70%
          }
        `}
        </Style>
      </div>
    )
  }
}

ChatMessage.contextTypes = {
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default ChatMessage
