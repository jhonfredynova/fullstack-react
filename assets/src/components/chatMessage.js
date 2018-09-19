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
    const { className } = this.props
    return (
      <div id="chatMessage" className={className}>
        <div className="messageWrap">
          <h2 className="text-center"><i className="fa fa-comments fa-2x" /></h2>
          <p className="text-center">{this.context.t('chatEmpty')}</p>
          <div className="d-flex flex-row">
            <div className="alert alert-primary">Hola <small>15/09/2018</small></div>
          </div>
          <div className="d-flex flex-row-reverse">
            <div className="alert alert-secondary">Que tal como esta? <small>15/09/2018</small></div>
          </div>
          <div className="d-flex flex-row">
            <div className="alert alert-primary">Bien que hay que hacer por alla? esta todo bien o hay algún problema? <small>16/09/2018</small></div>
          </div>
          <div className="d-flex flex-row-reverse">
            <div className="alert alert-secondary">Todo bien, todo sin novedad<small>17/09/2018</small></div>
          </div>
          <div className="d-flex flex-row">
            <div className="alert alert-primary d-flex flex-row">Ha bueno bien entonces, chao estamos hablando! <small>Hace 1 hora</small></div>
          </div>
          <div className="d-flex flex-row-reverse">
            <div className="alert alert-secondary">Ok Ciudese <small>Hace un momento</small></div>
          </div>
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
