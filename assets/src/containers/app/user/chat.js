import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import Sidebar from "react-sidebar"
import { set } from 'lodash'
import ChatMessage from 'components/chatMessage'
import NavigationBar from 'components/navigationBar'
import { hideLoading, showLoading, setMessage } from 'actions/appActions'
import { getChat, saveChat, saveChatMessage } from 'actions/chatActions'
import { Style } from 'react-style-tag'

import socketIOClient from 'socket.io-client'
import sailsIOClient from 'sails.io.js'


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
      chat: { messages: [] },
      chats: this.props.chat.chats,
      chatQuery: {
        isLoading: false,
        pageSize: 10,
        select: ['updatedAt','id','from'],
        sort: [
          { updatedAt: 'DESC' }
        ],
        where: {
          to: session.id
        }
      }
    }
  }

  componentDidMount() {
    const io = sailsIOClient(socketIOClient)
    io.sails.url = 'http://localhost:1337'
    io.sails.headers = {
      authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNWI2YWZlNGI3MjE3YWVkNmU5MTQxNzA2IiwiY3JlYXRlZEF0IjoxNTMzNzM4NTcxNDE2LCJ1cGRhdGVkQXQiOjE1MzM3Mzg1NzE0MTYsImFjdGl2ZSI6dHJ1ZSwiZmlyc3RuYW1lIjoiSmhvbiIsImxhc3RuYW1lIjoiTm92YSIsInVzZXJuYW1lIjoiamhvbmZyZWR5bm92YSIsImVtYWlsIjoiamhvbmZyZWR5bm92YUBnbWFpbC5jb20iLCJlbWFpbENvbmZpcm1lZCI6ZmFsc2UsInBob3RvIjoiaHR0cHM6Ly9wbGF0Zm9ybS1sb29rYXNpZGUuZmJzYnguY29tL3BsYXRmb3JtL3Byb2ZpbGVwaWMvP2FzaWQ9MTU5NDIxNTE1NDAwMTk0OSZoZWlnaHQ9MjAwJndpZHRoPTIwMCZleHQ9MTUzNjMzMDU3MSZoYXNoPUFlVE40N09nVjRMc2hMdmQiLCJwcmVmZXJlbmNlcyI6W10sImNsaWVudENvZGUiOiIiLCJwbGFuIjoiNWI0Y2NlMDgwYWY5OTAzMmIyMTM0OGE4In0sImlhdCI6MTUzMzczODU3MiwiZXhwIjoxNTMzNzQwMDEyfQ.QMKQAiQUvQeQZ6R4nA9VmoEW6-RR117-RDGdP0WO-h8' 
    }
    io.sails.useCORSRouteToGetCookie = false

    io.socket.on('connect', () => {
      console.warn("Socket connected!")
    })
    //change
    io.socket.on('/api/catalog', (data) => {
      console.warn('CHANGE')
      console.warn(data)
    })
    //list
    io.socket.get('/api/catalog', (data) => {
      console.warn('LIST')
      console.warn(data)
    })
    //request
    io.socket.get('/api/plan', function (resData, jwres){
      console.warn('GET')
      console.warn(jwres.statusCode)
      console.warn(resData)
    })
    //post
    io.socket.post('/api/catalog', { name: 'test2', value: {}, order:1 }, function(resData, jwres){
      console.warn('POST')
      console.warn(jwres.statusCode)
      console.warn(resData)
    })
    //update
    io.socket.put('/api/catalog/5ba1744991d295428cc5150e', { name: 'test', value: {}, order:1 }, function(resData, jwres){
      console.warn('PUT')
      console.warn(jwres.statusCode)
      console.warn(resData)
    })
    //delete
    io.socket.delete('/api/catalog/5ba1744991d295428cc5150e', function(resData){
      console.warn('DELETE')
      console.warn(resData)
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      chats: nextProps.chat.chats
    })
  }

  async componentWillMount(){
    try{
      this.props.dispatch(showLoading())
      this.state.sidebarMql.addListener(this.handleMediaQuery)
      document.addEventListener('keydown', this.handlePressKey, false)
      await this.props.dispatch(getChat(this.state.chatQuery))
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

  async handleSaveChat(data){
    try{
      this.props.dispatch(showLoading())
      if(!this.state.chat.id){
        this.state.chat.id = await this.props.dispatch(saveChat())
      }
      this.props.dispatch(saveChatMessage(this.state.chat))
      this.props.dispatch(hideLoading())
    }catch(e){
      this.props.dispatch(setMessage({ type: 'error', message: e.message }))
      this.props.dispatch(hideLoading())
    }
  }

  render(){
    const { isLoading } = this.props.app
    const { records } = this.state.chats
    const chatConversations = (
      <div className="card">
        <div className="card-header">
          <span className="float-left"><h2>{this.context.t('messages')}</h2></span>
          <span className="float-right"><button className="btn btn-success"><i className="fas fa-edit" /></button></span>
          <span className="clearfix" />
        </div>
        <div className="card-body" onScroll={this.handleChatScroll.bind(this)}>
          {
            <div>
              {
                records.map((item, index) => 
                  <div key={item.id} />
                )
              }
              <div className={(classnames({'text-center': true, 'd-none': !isLoading}))}><i className="fa fa-spinner fa-spin fa-2x"></i></div>
            </div>
          }
        </div>
      </div>
    )
    return (
      <div id="chat">
        <Sidebar rootClassName='sidebarRoot' sidebarClassName='sidebar' contentClassName='sidebarContent' overlayClassName='sidebarOverlay' docked={this.state.sidebarDocked} sidebar={chatConversations} open={this.state.sidebarOpen} onSetOpen={() => this.handleChangeState('sidebarOpen',false)}>
          <NavigationBar 
            title={<h1>{this.context.t('chatTitle')}</h1>} 
            description={<h2>{this.context.t('chatDescription')}</h2>} 
            btnLeft={(this.state.sidebarDocked ? null : <button className="btn btn-success" onClick={() => this.handleChangeState('sidebarOpen', !this.state.sidebarOpen)}><i className="fas fa-right" /></button>)} />
          <ChatMessage query={this.state.chat} onSend={this.handleSaveChat.bind(this)} />
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
    chat: state.chat
  }
}

export default connect(mapStateToProps)(Chat)
