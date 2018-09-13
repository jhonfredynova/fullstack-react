import  React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'

class Footer extends React.PureComponent {

  render() {
    const { isLoading, app } = this.props
    const { appDisabled } = app.config
    const social = app.config.social || {}
    return (
      <footer className="mt-4 pt-4 border-top">
        <div className='container text-body'>
          <div className="row">
            <div className="col-md-12 text-center">
              <ul className="list-inline">
                <li className="list-inline-item"><a href={social.facebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook fa-2x text-dark"></i></a></li>
                <li className="list-inline-item"><a href={social.twitter} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter fa-2x text-dark"></i></a></li>
                <li className="list-inline-item"><a href={social.linkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin fa-2x text-dark"></i></a></li>
                <li className="list-inline-item"><a href={social.youtube} target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube fa-2x text-dark"></i></a></li>
              </ul>
            </div>
          </div>
          <div className={classnames({'row': true, 'hide': (isLoading || appDisabled)})}>
            <div className="col-md-12 text-center">
              <ul className="list-inline">
                <li className="list-inline-item"><Link className="text-dark" to="/docs">{this.context.t('docs')}</Link></li>
                <li className="list-inline-item"><Link className="text-dark" to="/faq">{this.context.t('faq')}</Link></li>
                <li className="list-inline-item"><Link className="text-dark" to="/privacy">{this.context.t('privacy')}</Link></li>
                <li className="list-inline-item"><Link className="text-dark" to="/terms">{this.context.t('terms')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    )
  }

}

Footer.contextTypes = {
  store: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

export default Footer
