// Config settings for NODE_ENV=development

exports.config = {
  queue_url: 'https://sqs.us-east-1.amazonaws.com/815065750889/tracking-events-development',
  api_base_url: "http://localhost:3000",
  base_url: "http://localhost:3030",
  vanity_url: "http://localhost:3030",
  admin_url: "http://localhost:3060",
  memcachedEndpoint: "127.0.0.1:11211",
  sendgrid: {
    "user": "accounts@simplelabsinc.com",
    "password": "TrySwell123",
    "api_key": "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"
  },
  "sentry": {
    "DSN": "52a19bcbfdc14b55b094a1972a4e4fed",
    "path": "77566"
  },
  typeform: {
    "key": "bb49927ab09efc65fe523ae53b78d344ef915920"
  },
  mixpanel: {
    api_key: "7c3736dd54dca2ceb963c019e4b8d459",
    api_secret: "17a0fe3271e27cfbe9d09ed7b38651b8",
    token: "4f65c8097814584ec4269a19b8aaacb8"
  },
  "stripe": {
    key: "sk_test_TNOR2L6hPnkIsRWoY0dQRHpr",
    publishableKey: "pk_test_p2z3SdlShganZ9GXhifsDDJZ"
  },
  facebook: {
    app_id : "213632148790361",
    app_secret : "8010420b9b637782cc690589753d7d6f"
  },
  aws: {
    "endpoint": "localhost:4567",
    "region": "us-east-1"
  },
  slack: {
    key: 'xb7OXtyxCem1f3y61sluMKyZ',
    app_id: '1',
    callback_url: 'http://localhost:3090/relay/slack/response',
    secret: '2U7SXJj0u4tWHXIMcLxelIZa',
    name: 'Slack'
  },
  runtime: {

  },
  "campaigns": {
    "goal_running": {
      "starterNoteKey": "136:1",
      "starterFeedContent": ["136:150", "136:149", "136:146"]
    },
    "goal_productivity": {
      "starterNoteKey": "103:1",
      "starterFeedContent": ["136:150", "136:149", "136:146"]
    }
  },
  "twilio": {
    "accountSid": "AC6835ced00eb2997ec03003d788db4e4c",
    "key": "3f5aa0138d568f5e0f2a9848873f91e5",
    "primaryToken": "a83daa5da4cac6042a9558dee0bbb8df",
    "secondaryToken": "a83daa5da4cac6042a9558dee0bbb8df",
    "numbers": [
      {
        "name": "notes",
        "attributes": {"notes": true},
        "number": "+19175124914",
        "sid": "PN47b0c3241c44e406aa5d03fb1b58ab15"
      },
      {
        "name": "chat",
        "attributes": {"chat": true},
        "number": "+19174445942",
        "sid": "PN62b72002b164bb0b0fc877c7a0bce2b8"
      }
    ]
  },
  "wunderlist": {
    "client_id": "616d7a03f0897e1f8c70",
    "client_secret": "232c60d7c018afc783a0db69c067a1d480a02aaf409700ae7b8332fd3c4b",
    "redirect_uri": "http://swellist-web.ngrok.io/wunderlist/callback",
    "update_uri": "http://swellist-web.ngrok.io/wunderlist/update"
  },
  "google": {
    "client_id": "758301088515-mm0cgkcvuhk1pa2gr3r3vtjhmccopiei.apps.googleusercontent.com",
    "project_id": "user-locations",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "p1lQWDEe4I90CCRnh6VXnJcU",
    "redirect_uri": "http://rawbee.ngrok.io/auth/google/success"
  }
};
