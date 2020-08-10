# Cron AuthNet Shipstation integration

## Requirements:

1. Node.js version 14+

## Configuration:

1. Env variables:

```dotenv
AUTHNET_API_LOGIN_ID=31111111x
AUTHNET_TRANSACTION_KEY=3111111111111117
# Default environment (optional)
AUTHNET_ENVIRONMENT=test
SHIPSTATION_API_KEY=41111111111111111111111111111111
SHIPSTATION_API_SECRET=8111111111111111111111111111111b
# cron schedule (optional)
CRON_SCHEDULE="0 0 * * * *"
# cron time zone (optional) https://momentjs.com/timezone/
CRON_TIMEZONE="America/New_York"
# Disable saving output files on disk
SAVE_OUTPUT_IN_FILES=false
BIGCOMMERCE_ACCESS_TOKEN=324sdf234dsf
BIGCOMMERCE_CLIENT_ID=7sdfsd4r324v
BIGCOMMERCE_STORE_HASH=jsdfs34u8d
```
