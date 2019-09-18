const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (

      <footer className="nav-footer" id="footer">

        <div id="social_links">

          <a href="https://twitter.com/PolyelPHP" target="__blank"><img src="/img/twitter-logo.png"/></a>
          <a href="https://github.com/Superbition/Polyel" target="__blank"><img src="/img/github-logo.png"/></a>

        </div>

        <section className="copyright">{this.props.config.copyright}</section>

        <div id="end_logo"><img src="/img/logo.png"/></div>

      </footer>
    );
  }
}

module.exports = Footer;
