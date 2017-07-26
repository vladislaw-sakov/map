exports.config = {
  "productName": "Swellist",
  "api_base_url": "https://api.swellist.com",
  "base_url": "https://swellist.com",
  "vanity_url": "https://swellist.com",
  "admin_url": "http://admin.swellist.com",
  "memcachedEndpoint": "prod-mc-cluster-1.dlbssw.cfg.use1.cache.amazonaws.com:11211",
  "mixpanel": {
    api_key: "7c3736dd54dca2ceb963c019e4b8d459",
    api_secret: "17a0fe3271e27cfbe9d09ed7b38651b8",
    token: "4f65c8097814584ec4269a19b8aaacb8"
  },
  "sentry": {
    "DSN": "648dca3105a54e4d83cc8bb81ee63e6a",
    "path": "76995"
  },
  "sendgrid": {
    "user": "accounts@simplelabsinc.com",
    "password": "TrySwell123",
    "api_key": "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"
  },
  "aws": {
    region: "us-east-1"
  },
  "typeform": {
    "key": "bb49927ab09efc65fe523ae53b78d344ef915920"
  },
  "runtime": {
    "throttles": {
      "ios": {
        isEnabled: true
      }
    }
  },
  "campaigns": {
    "goal_running": {
      "starterNoteKey": "1010240:1",
      "starterFeedContent": ["1010240:3", "1010240:4", "1010240:5", "1010240:6", "1010240:7", "1010240:10"]
    },
    "goal_productivity": {
      "starterNoteKey": "1010241:1",
      "starterFeedContent": ["1010241:4", "1010241:7", "1010241:8", "1010241:10", "1010241:11", "1010241:23", "1010241:24", "1010241:26"]
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
        "number": "+19175124284",
        "sid": "PNf520be173fbf61148674aab3b1a948ea"
      },
      {
        "name": "chat",
        "attributes": {"chat": true},
        "number": "+19174445770",
        "sid": "PNc9356d3a4b556aefb6578e8754c8be31"
      }
    ]
  },
  "slack": {
    key: 'xb7OXtyxCem1f3y61sluMKyZ',
    app_id: '5000000',
    callback_url: 'http://relay.simplelabsinc.com/relay/slack/response',
    secret: '2U7SXJj0u4tWHXIMcLxelIZa',
    name: 'Slack'
  },
  "stripe": {
    key: "sk_live_aKN9Ivkfjz4qwC75uyGwwwhf",
    publishableKey: "pk_live_2az2CZUBeRa4rrxJSaFba7QQ"
  },
  "wunderlist": {
    "client_id": "c057158a484d2d014624",
    "client_secret": "3b503a092c620f92da12ab3bdbf9c33aa097501e425e33d47a8e77afb181",
    "redirect_uri": "https://swellist.com/wunderlist/callback",
    "update_uri": "https://swellist.com/wunderlist/update"
  },
  google: {
    "client_id": "284482778119-uvcva84jm702a9qfeppej0ecr7lekug6.apps.googleusercontent.com",
    "project_id": "user-locations",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "Ls3GLB84NJ9p3pIlrkF0xmP5",
    "redirect_uri": "https://swellist.com/auth/google/success"
  }
}
