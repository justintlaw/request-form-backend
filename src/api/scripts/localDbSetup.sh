aws dynamodb create-table \
  --table-name maintenance_requests \
  --attribute-definitions AttributeName=id,AttributeType=S \
                          AttributeName=status,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"StatusIndex\",
        \"KeySchema\": [{\"AttributeName\":\"status\",\"KeyType\":\"HASH\"}],
        \"Projection\": {\"ProjectionType\": \"ALL\"}
      }
    ]" \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
