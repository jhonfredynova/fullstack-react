import React from 'react'
import PropTypes from 'prop-types'
import { defaultTo, isEmpty, set, flow, cloneDeep, clean, compact, get } from 'lodash'
import { setMessage } from 'actions/appActions'
import { Style } from 'react-style-tag'

class ChatMessage extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      errors: {},
      seen: defaultTo(this.props.seen, false),
      value: defaultTo(this.props.value, '')
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleValidate(path){
    let errors = flow(cloneDeep, clean)(this.state.errors)
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
      if(!flow(cloneDeep, compact, isEmpty)(this.state.errors)){
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
    const { className } = this.props
    return (
      <div id="chatMessage" className={className}>
        <div className="messageWrap">
          <h2><i className="fa fa-comments-o fa-2x" /></h2>
          <p>{this.context.t('chatEmpty')}</p>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
          <div className="alert alert-info">Hola</div>
        </div>
        <form className="editorWrap" onSubmit={this.handleSendMessage.bind(this)}>
          <div className="input-group">
            <input type="text" className="form-control" />
            <div className="input-group-btn">
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
            height: 75%;
            text-align: center;
            overflow: auto;
          }
          #chatMessage .messageWrap h2{
            margin-top: 0px;
          }
          #chatMessage .editorWrap{
            position: absolute;
            bottom: 0px;
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
