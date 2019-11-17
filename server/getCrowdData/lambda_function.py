import json

import boto3

import transformer 


def lambda_handler(event, context):

  dynamodb = boto3.resource('dynamodb')

  tableCrowdBaseRaw = dynamodb.Table('crowdbase-count')
   
  items = tableCrowdBaseRaw.scan(Limit=1000)['Items']
  
  geojson_items = transformer.transform_to_geojson(items)
  

  
  return geojson_items