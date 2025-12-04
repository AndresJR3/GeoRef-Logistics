#!/bin/bash

# Validate inputs
if [ -z "$TESTRIGOR_AUTH_TOKEN" ]; then
  echo "Error: TESTRIGOR_AUTH_TOKEN environment variable is not set"
  exit 1
fi

if [ -z "$TESTRIGOR_SUITE_ID" ]; then
  echo "Error: TESTRIGOR_SUITE_ID environment variable is not set"
  exit 1
fi

if [ -z "$APP_URL" ]; then
  echo "Error: APP_URL environment variable is not set"
  exit 1
fi

echo "Triggering TestRigor for Suite ID: $TESTRIGOR_SUITE_ID"
echo "Testing URL: $APP_URL"

# Trigger the retest
# We use the 'url' parameter to tell TestRigor where to test
RESPONSE=$(curl -s -X POST \
  -H "Content-type: application/json" \
  -H "auth-token: $TESTRIGOR_AUTH_TOKEN" \
  --data "{ \"url\": \"$APP_URL\", \"forceCancelPreviousTesting\": true }" \
  "https://api.testrigor.com/api/v1/apps/$TESTRIGOR_SUITE_ID/retest")

echo "Trigger Response: $RESPONSE"

# Extract the Run ID (TestRigor doesn't always return the Run ID directly in the retest response, 
# but usually we can just poll the status endpoint if we just triggered it. 
# However, for concurrency safety, we should ideally get the run ID.
# The user's script just polls the status of the 'latest' run or the suite status.
# We will follow the user's pattern of polling the suite status.)

echo "Waiting for tests to start..."
sleep 10

# Poll for status
while true
do
  echo "-----------------------------------"
  echo "Checking run status..."
  
  STATUS_RESPONSE=$(curl -s -X GET "https://api.testrigor.com/api/v1/apps/$TESTRIGOR_SUITE_ID/status" \
    -H "auth-token: $TESTRIGOR_AUTH_TOKEN" \
    -H "Accept: application/json")
  
  # Extract status code (simple parsing)
  # In a real CI env, we might want to use jq, but we'll try to be dependency-light or assume jq is available (it is in GH Actions)
  
  # Using jq if available, otherwise fallback to grep/awk
  if command -v jq &> /dev/null; then
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
  else
    # Fallback parsing
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  fi
  
  echo "Current Status: $STATUS"
  
  case $STATUS in
    "New"|"In progress"|"In_queue")
      echo "Tests are running..."
      ;;
    "Finished")
      echo "Tests finished successfully!"
      exit 0
      ;;
    "Failed")
      echo "Tests failed."
      exit 1
      ;;
    "Canceled")
      echo "Tests canceled."
      exit 1
      ;;
    *)
      # Handle cases where status might be missing or different
      echo "Unknown status or waiting: $STATUS"
      # If we get a 4xx/5xx from the curl itself, we might want to retry or fail
      ;;
  esac
  
  sleep 10
done
