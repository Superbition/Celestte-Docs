import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import FooterLinks from '@theme/Footer/Links';
import FooterLogo from '@theme/Footer/Logo';
import FooterCopyright from '@theme/Footer/Copyright';
import FooterLayout from '@theme/Footer/Layout';
function Footer() {
  const {footer} = useThemeConfig();
  if (!footer) {
    return null;
  }
  const {copyright, links, logo, style} = footer;
  return (

    // Original footer saved...
    /*<FooterLayout
      style={style}
      links={links && links.length > 0 && <FooterLinks links={links} />}
      logo={logo && <FooterLogo logo={logo} />}
      copyright={copyright && <FooterCopyright copyright={copyright} />}
    />*/

    <footer>

      <div id="footerSocialLinks">

        <a href="https://twitter.com/voltis_io" target="__blank"><img src="/img/twitter-logo.png"/></a>
        <a href="https://github.com/Superbition/Voltis" target="__blank"><img src="/img/github-logo.png"/></a>

      </div>

      <p><FooterCopyright copyright={copyright}/></p>

      <div id="footerProjectLogo"><img src="/img/logo.png"/></div>

    </footer>
  );
}
export default React.memo(Footer);
