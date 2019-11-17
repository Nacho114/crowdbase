import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

import utils

#That's the lambda handler, you can not modify this method
# the parameters from JSON body can be accessed like deviceId = event['deviceId']
def lambda_handler(event, context):
    # Instanciating connection objects with DynamoDB using boto3 dependency
    dynamodb = boto3.resource('dynamodb')
    client = boto3.client('dynamodb')
    
    # Getting the table the tables object
    crowdbaseRawTable = dynamodb.Table('crowdbase-raw')
    crowdbaseCountTable = dynamodb.Table('crowdbase-count')
    
    
    timestamp = int(event['timestamp'])
    deviceId = event['deviceId']
    ssid = event['ssid']
    mac = event['mac']
    signal = event['signal']
    
    
    # Putting a try/catch to log to user when some error occurs
    try:
        
        crowdbaseRawTable.put_item(
           Item={
                'timestamp': timestamp,
                'deviceId': deviceId,
                'ssid': ssid,
                'mac': mac,
                'signal': signal
            }
        )
      
      
        count_items = crowdbaseCountTable.query(
            KeyConditionExpression=Key('deviceId').eq(deviceId)
        )['Items']       

       
        max_timestamp = 0 
        
        if len(count_items) > 0:
            max_timestamp = int(count_items[-1]['timestamp'])
        
        
        if timestamp - max_timestamp > utils.MINUTE_TIME_STAMP:
            
            # Get values with same deviceId, with timestamp 
            # greater than max_timestamp (i.e. not yet written)
            raw_items = crowdbaseRawTable.query(
                KeyConditionExpression=Key('deviceId').eq(deviceId) & Key('timestamp').gt(max_timestamp)
            )['Items']   
  
            utils.update_count(crowdbaseCountTable, raw_items, deviceId, timestamp)
        
        
        return {
            'statusCode': 200,
            'body': json.dumps('Succesfully inserted data!')
        }
    except:
        print('Closing lambda function')
        return {
                'statusCode': 400,
                'body': json.dumps('Error saving the data')
        }
    