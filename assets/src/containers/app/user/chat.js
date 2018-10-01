import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import { isEmpty, set } from 'lodash'
import Select from 'react-select'
import ChatConversation from 'components/chatConversation'
import ChatMessage from 'components/chatMessage'
import NavigationBar from 'components/navigationBar'
import Style from 'components/style'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getChat, getChatMessage, saveChat, updateChat } from 'actions/chatActions'
import { getUser } from 'actions/userActions'
const sidebarMql = window.matchMedia(`(min-width: 768px)`)

class Chat extends React.PureComponent {

  constructor(props){
    super(props)
    const { session } = this.props.auth
    this.handleMediaQuery = this.handleMediaQuery.bind(this)
    this.handlePressKey = this.handlePressKey.bind(this);
    this.state = {
      sidebarDocked: sidebarMql.matches,
      sidebarMql: sidebarMql,
      sidebarOpen: false,
      chat: {},
      chats: this.props.chat.chats,
      users: this.props.user.users,
      chatQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['updatedAt','id','from','to'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          from: session.id
        }
      },
      chatMessageQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['createdAt','value','seen'],
        sort: [
          { updatedAt: 'DESC' }
        ]
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      chats: nextProps.chat.chats,
      users: nextProps.user.users
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      this.state.sidebarMql.addListener(this.handleMediaQuery)
      document.addEventListener('keydown', this.handlePressKey, false)
      await this.props.dispatch(getChat(this.state.chatQuery))
      const { session } = this.props.auth
      this.props.dispatch(getUser({ select: ['id','firstname','lastname','email'], where: { active: true, id: { '!=': session.id } }}))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  componentWillUnmount() {
    try{
      this.state.sidebarMql.removeListener(this.handleMediaQuery)
      document.removeEventListener('keydown', this.handlePressKey, false);
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChangeState(path, value){
    this.setState(set(this.state, path, value))
  }

  async handleMediaQuery(){
    try{
      this.setState({ sidebarDocked: this.state.sidebarMql.matches, sidebarOpen: false });
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handlePressKey(e){
    try{
      if(e.keyCode===27) {
        this.setState({ sidebarOpen: false })
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatLoad(chat){
    try{
      this.props.dispatch(showLoading())
      await this.setState({ chat: chat })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatSave(message){
    try{
      this.props.dispatch(showLoading())
      const { session } = this.props.auth
      const chat = {
        ...this.state.chat,
        to: this.state.chat.to.id,
        from: session.id
      }
      if(!chat.id) await this.props.dispatch(saveChat(chat))
      else await this.props.dispatch(updateChat(chat))
      const { records: chats } = this.props.chat
      const chatUpdated = chat.id ? chats.find(item => item.id===chat.id) : chats.shift()
      this.setState({ chat: chatUpdated })
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }
  
  async handleChatScroll(event){
    try{
      const { target: element } = event
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && element.offsetHeight+element.scrollTop===element.scrollHeight){
        this.props.dispatch(showLoading())
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
        await this.props.dispatch(getChat(this.state.chatQuery))
        this.props.dispatch(hideLoading())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  async handleChatMessageScroll(event){
    try{
      const { target: element } = event
      const { records, recordsTotal } = this.state.chats
      if(records.length+1<recordsTotal && element.offsetHeight+element.scrollTop===element.scrollHeight){
        this.props.dispatch(showLoading())
        await this.setState({ chatQuery: Object.assign(this.state.chatQuery, { pageSize: this.state.chatQuery.pageSize+5 }) })
        await this.props.dispatch(getChat(this.state.chatQuery))
        this.props.dispatch(hideLoading())
      }
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render(){
    const { isLoading } = this.props.app
    const { defaultUser: defaultUserPhoto } = this.props.app.config.images
    const { chat } = this.state
    const { records: chats } = this.state.chats
    const { records: users } = this.state.users
    const chatHeader = {
      title: isEmpty(chat) ? this.context.t('chatTitle') : <span><img className="rounded-circle" src={chat.to.photo || defaultUserPhoto} alt={chat.to.fullname} height={40} /> {chat.to.fullname}</span>,
      description: isEmpty(chat) ? this.context.t('chatDescription') : chat.to.email
    }
    const chatConversations = (
      <div className="card">
        <div className="card-header">
          <span className="text-left"><h2>{this.context.t('messages')}</h2></span>
        </div>
        <div className="card-body" onScroll={this.handleChatScroll.bind(this)}>
          <div className="form-group mb-0">
            <Select className="form-control" placeholder={`${this.context.t('search')}...`} options={users} optionRenderer={item => <span>{item.fullname}</span>} valueRenderer={item => <span>{item.fullname}</span>} valueKey='id' simpleValue={false} clearable={true} autosize={false} onChange={item => this.handleChatLoad({ to: item })} />
          </div>
          { !isLoading && chats.length===0 &&
            <p className="text-center p-2">{this.context.t('chatConversationsEmpty')}</p>
          }
          {
            chats.map(item => {
              item.to.photo = item.to.photo || defaultUserPhoto
              return <ChatConversation key={item.id} chat={item} onSelect={this.handleChatLoad.bind(this, item)} />
            })
          }
          <div className={(classnames({'text-center p-2': true, 'd-none': !isLoading}))}><i className="fa fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar 
            title={<h1>{chatHeader.title}</h1>} 
            description={<h2>{chatHeader.description}</h2>} 
            btnLeft={(this.state.sidebarDocked ? null : <button className="btn btn-success" onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="fas fa-arrow-right" /></button>)} />
          <ChatMessage isLoading={isLoading} chat={chat} onScroll={this.handleChatMessageScroll.bind(this)} onSend={this.handleChatSave.bind(this)} />
        </Sidebar>
        <Style>
        {`
          #chat{
            margin-top: 20px;
            position: relative;
            height: 600px;
          }
          #chat .card{
            margin-bottom: 0px;
            width: 250px;
          }
          #chat .card .card-header{
            max-height: 58px;
            padding: 8px;
          }
          #chat .card .card-header h2{
            font-size: 22px;
            margin: 5px 0px;
          }
          #chat .card .card-body{
            height: 540px;
            padding: 0px;
            overflow: auto;
          }
          @media only screen and (max-width: 768px) {
            #chat .card .card-body{
              height: auto;
            }
          }
          /* sidebar */
          #chat .sidebar{
            position: absolute;
            background-color: white;
            z-index: 1050!important;
            overflow-y: visible!important;
          }
          #chat .sidebarRoot{
            padding: 15px
          }
          #chat .sidebarContent{
            overflow-y: hidden!important;
            padding-left: 15px;
          }
          #chat .sidebarOverlay{
            z-index: 1040!important;
          }
          @media only screen and (max-width: 768px) {
            #chat .sidebar{
              position: fixed!important;
            }
          }
          /* infinityScroll */
          #chat .infinite-scroll-component{
            width: 250px;
          } 
        `}
        </Style>
      </div>
    )
  }
}

Chat.contextTypes = {
  t: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
  return {
    app: state.app,
    auth: state.auth,
    chat: state.chat,
    user: state.user
  }
}

export default connect(mapStateToProps)(Chat)
