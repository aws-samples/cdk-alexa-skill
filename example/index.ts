/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as cdk from '@aws-cdk/core';
import * as lambdaPython from '@aws-cdk/aws-lambda-python';
import * as ssm from '@aws-cdk/aws-ssm';
import { Skill } from '../src';

const ALEXA_DEVELOPER_SSM_PARAM_PREFIX = '/alexa-developer/'


export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get Alexa Developer credentials from SSM Parameter Store
    const alexaVendorId = ssm.StringParameter.valueForStringParameter(this, `${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}vendor-id`);
    const lwaClientId = ssm.StringParameter.valueForStringParameter(this, `${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}client-id`);
    const lwaClientSecret = cdk.SecretValue.secretsManager(`${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}client-secret`);
    const lwaRefreshToken = cdk.SecretValue.secretsManager(`${ALEXA_DEVELOPER_SSM_PARAM_PREFIX}refresh-token`);
    
    // Create the Lambda Function for the Skill Backend
    const skillBackend = new lambdaPython.PythonFunction(this, 'SkillBackend', {
      entry: 'lambda',
      timeout: cdk.Duration.seconds(7)
    });

    // Create the Alexa Skill
    new Skill(this, 'Skill', {
      endpointLambdaFunction: skillBackend,
      skillPackagePath: 'skill-package',
      alexaVendorId: alexaVendorId,
      lwaClientId: lwaClientId,
      lwaClientSecret: lwaClientSecret,
      lwaRefreshToken: lwaRefreshToken
    });
  }
}
