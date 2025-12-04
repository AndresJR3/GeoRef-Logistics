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

# Prepare the JSON payload with test cases
# We read the test_definitions.json and embed it into the baselineMutations field
# We also include the URL and other parameters

if [ -f "test_definitions.json" ]; then
  echo "Found test_definitions.json, including in request..."
  # Use jq to construct the payload safely
  # We set explicitMutations: false so we don't delete existing tests in the suite, just add/update these.
  # If you want to ONLY run these, you might want to use a different strategy, but for CI/CD usually we want to run everything or a subset.
  # Here we inject them as baseline mutations.
  
  PAYLOAD=$(jq -n \
    --arg url "$APP_URL" \
    --slurpfile cases test_definitions.json \
    '{
      url: $url, 
      forceCancelPreviousTesting: true, 
      baselineMutations: $cases[],
      explicitMutations: false
    }')
else
  echo "No test_definitions.json found, running existing suite..."
  PAYLOAD=$(jq -n \
    --arg url "$APP_URL" \
    '{
      url: $url, 
      forceCancelPreviousTesting: true
    }')
fi

echo "Triggering TestRigor for Suite ID: $TESTRIGOR_SUITE_ID"
echo "Testing URL: $APP_URL"

# Trigger the retest
RESPONSE=$(curl -s -X POST \
  -H "Content-type: application/json" \
  -H "auth-token: $TESTRIGOR_AUTH_TOKEN" \
  --data "$PAYLOAD" \
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
  
  # Extract status and details URL
  # We try to use jq if available, otherwise simple grep/cut
  if command -v jq &> /dev/null; then
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
    DETAILS_URL=$(echo "$STATUS_RESPONSE" | jq -r '.detailsUrl // empty')
  else
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    # Basic attempt to extract detailsUrl if jq is missing
    DETAILS_URL=$(echo "$STATUS_RESPONSE" | grep -o '"detailsUrl":"[^"]*"' | cut -d'"' -f4)
  fi
  
  # Print the URL once if we found it and haven't printed it yet
  if [ -n "$DETAILS_URL" ] && [ "$DETAILS_URL" != "null" ] && [ -z "$PRINTED_URL" ]; then
    echo "View execution details here: $DETAILS_URL"
    PRINTED_URL="true"
  fi
  
  echo "Current Status: $STATUS"
  
  case $STATUS in
    "New"|"In progress"|"In_queue")
      echo "Tests are running..."
      ;;
    "Finished")
      echo "Tests finished successfully!"
      if [ -n "$DETAILS_URL" ]; then
        echo "Full Report: $DETAILS_URL"
      fi
      exit 0
      ;;
    "Failed")
      echo "Tests failed."
      if [ -n "$DETAILS_URL" ]; then
        echo "See failure details: $DETAILS_URL"
      fi
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
