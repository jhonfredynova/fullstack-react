import  React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { defaultTo } from 'lodash'

class SEO extends Component {

  constructor(props){
    super(props)
    this.state = {
      title: defaultTo(this.props.data.title, ''),
      description: defaultTo(this.props.data.description, ''),
      keywords: defaultTo(this.props.data.keywords, []),
      siteName: defaultTo(this.props.data.siteName, '')
    }
  }

  componentWillReceiveProps(nextProps){
    this.setState(nextProps.data)
  }

  render() {
    if (this.state.title==='') return null
    return (
      <Helmet>
        {/* HTML */}
        <title>{this.state.title}</title>
        <meta name="description" content={this.state.description} />
        <meta name="keywords" content={this.state.keywords.join(',')} />
        <meta name="robots" content="index, follow" />
        {/* FACEBOOK */}
        <meta property="og:title" content={this.state.title} />
        <meta property="og:type" content="business.business" />
        <meta property="og:site_name" content={this.state.siteName} />
        <meta property="og:description" content={this.state.title} /> 
        {/* TWITTER  */}
        <meta name="twitter:card" content={this.state.description} />
        <meta name="twitter:creator" content="@venpadapp" />
        <meta name="twitter:site" content="@venpadapp" />
      </Helmet>
    )
  }
}

export default SEO
