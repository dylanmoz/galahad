module.exports = {
  siteMetadata: {
    title: `galahad`,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-glamor',
    'gatsby-plugin-sass',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-105846113-1',
      },
    }
  ],
  pathPrefix: '/galahad'
}
