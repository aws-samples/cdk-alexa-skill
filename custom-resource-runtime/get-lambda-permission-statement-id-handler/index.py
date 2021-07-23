# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import json
import boto3

client = boto3.client('lambda')

def lambda_handler(event, context):
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return
  if request_type == 'Delete': return
  raise Exception(f"Invalid request type: {request_type}")

def on_create(event):
  function_arn = event['ResourceProperties']['lambda_function_arn']
  service_principal_to_match = event['ResourceProperties']['service_principal_to_match']
  principal_to_match = { 'Service': f'{service_principal_to_match}' }
  action_to_match = event['ResourceProperties']['action_to_match']

  print(f'Function ARN: {function_arn}')
  print(f'Service Principal to Match: {service_principal_to_match}')
  print(f'Action to Match: {action_to_match}')

  response = client.get_policy(FunctionName=function_arn)

  print(f'Response: {response}')

  policy_string = response['Policy']
  policy = json.loads(policy_string)
  statement_list = policy['Statement']

  # gets 'Sid' property of first item in list where principal and action match the passed in values
  statement_id = next((statement['Sid'] for statement in statement_list if statement['Principal'] == principal_to_match and statement['Action'] == action_to_match), None)

  print(f'Statement ID: {statement_id}')

  return {
    'Data': {
      'statement_id': statement_id
    }
  }
