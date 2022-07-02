/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {

  docs: [

    {
      type: 'category',
      label: 'Introduction',
      link: {type: 'doc', id: 'introduction'},
      items: []
    },

    {
      type: 'category',
      label: 'Requirements',
      link: {type: 'doc', id: 'requirements'},
      items: []
    },

    {
      type: 'category',
      label: 'Release Process',
      link: {type: 'doc', id: 'release_process'},
      items: []
    },

    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting_started/install', 
        'getting_started/configuration', 
        'getting_started/directory_format', 
        'getting_started/development', 
        'getting_started/faq'
      ],
    },

    {
      type: 'category',
      label: 'Architectural Design',
      collapsed: false,
      items: [
        'architectural_design/request_lifecycle', 
        'architectural_design/third_party_packages', 
      ],
    },

    {
      type: 'category',
      label: 'Using Voltis',
      collapsed: false,
      items: [
        'using_voltis/routing', 
        'using_voltis/controllers', 
        'using_voltis/middleware',
        'using_voltis/request',
        'using_voltis/response',
        'using_voltis/csrf_protection',
        'using_voltis/views',
        'using_voltis/elements',
        'using_voltis/session',
        'using_voltis/validation',
        'using_voltis/storage',
        'using_voltis/console',
        'using_voltis/services',
      ],
    },

    {
      type: 'category',
      label: 'Database',
      collapsed: false,
      items: [
        'database/introduction', 
        'database/query_builder',
      ],
    },

    {
      type: 'category',
      label: 'Security',
      collapsed: false,
      items: [
        'security/encryption', 
        'security/hashing',
        'security/authentication',
        'security/api_authentication',
        'security/email_verification',
        'security/password_reset',
      ],
    },
  ],

};

module.exports = sidebars;