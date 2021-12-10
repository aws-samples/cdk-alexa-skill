/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

// import { expect as expectCdk, not, haveResource, haveResourceLike, countResources, stringLike, ABSENT } from '@aws-cdk/assert';
import { Template, Match, Capture } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib/core';
import * as as from '../src';

const DummySkillPackagePath = 'test/dummy-skill-package/';
const DummyFunctionConstructId = 'dummy-function';
const DummyAlexaDeveloperVendorId = 'dummy-vendor-id';
const DummyAlexaDeveloperClientId = 'dummy-client-id';
const DummyAlexaDeveloperClientSecretString = 'dummy-client-secret';
const DummyValidAlexaDeveloperClientSecret = cdk.SecretValue.plainText(DummyAlexaDeveloperClientSecretString);
const DummyAlexaDeveloperRefreshTokenString = 'dummy-refresh-token';
const DummyValidAlexaDeveloperRefreshToken = cdk.SecretValue.plainText(DummyAlexaDeveloperRefreshTokenString);

function createDummyFunction(scope: cdk.Stack) {
  return new lambda.Function(scope, DummyFunctionConstructId, {
    runtime: lambda.Runtime.PYTHON_3_8,
    handler: 'index.handler',
    code: new lambda.InlineCode(`
def handler(event, context):
  print('Hello');
    `),
  });
}

function createTestSkillProps(scope: cdk.Stack, hasLambdaEndpoint: boolean, customProps: object): as.SkillProps {
  return {
    ... hasLambdaEndpoint && {
      endpointLambdaFunction: createDummyFunction(scope),
    },
    skillPackagePath: DummySkillPackagePath,
    alexaVendorId: DummyAlexaDeveloperVendorId,
    lwaClientId: DummyAlexaDeveloperClientId,
    lwaClientSecret: DummyValidAlexaDeveloperClientSecret,
    lwaRefreshToken: DummyValidAlexaDeveloperRefreshToken,
    ...customProps,
  };
}

/* eslint-disable quote-props */

describe('Alexa Skill', () => {
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    stack = new cdk.Stack();
  });

  describe('created with Lambda endpoint', () => {
    beforeEach(() => {
      new as.Skill(stack, 'Skill', createTestSkillProps(stack, true, {}));
      template = Template.fromStack(stack);
    });

    test('creates a Skill with Overrides property', () => {
      const functionConstructIdCapture = new Capture();

      template.hasResourceProperties('Alexa::ASK::Skill', Match.objectLike({
        'VendorId': DummyAlexaDeveloperVendorId,
        'AuthenticationConfiguration': {
          'ClientId': DummyAlexaDeveloperClientId,
          'ClientSecret': DummyAlexaDeveloperClientSecretString,
          'RefreshToken': DummyAlexaDeveloperRefreshTokenString,
        },
        'SkillPackage': {
          'Overrides': {
            'Manifest': {
              'apis': {
                'custom': {
                  'endpoint': {
                    'uri': {
                      'Fn::GetAtt': [functionConstructIdCapture, 'Arn'],
                    },
                  },
                },
              },
            },
          },
        },
      }));

      expect(functionConstructIdCapture.asString()).toEqual(expect.stringMatching(RegExp(`${DummyFunctionConstructId.replace('-', '')}*`)));
    });

    test('creates Custom Resources', () => {
      template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
      template.resourceCountIs('Custom::AWS', 2);
    });

    test('creates a proper Lambda Permission', () => {
      const functionConstructIdCapture = new Capture();

      template.hasResourceProperties('AWS::Lambda::Permission', {
        FunctionName: {
          'Fn::GetAtt': [functionConstructIdCapture, 'Arn'],
        },
        Principal: 'alexa-appkit.amazon.com',
        Action: 'lambda:InvokeFunction',
      });

      expect(functionConstructIdCapture.asString()).toEqual(expect.stringMatching(RegExp(`${DummyFunctionConstructId.replace('-', '')}*`)));
    });
  });

  describe('created with no Lambda endpoint', () => {
    beforeEach(() => {
      new as.Skill(stack, 'Skill', createTestSkillProps(stack, false, {}));
      template = Template.fromStack(stack);
    });

    test('creates a Skill with no Overrides property', () => {
      template.hasResourceProperties('Alexa::ASK::Skill', Match.objectLike({
        'VendorId': DummyAlexaDeveloperVendorId,
        'AuthenticationConfiguration': {
          'ClientId': DummyAlexaDeveloperClientId,
          'ClientSecret': DummyAlexaDeveloperClientSecretString,
          'RefreshToken': DummyAlexaDeveloperRefreshTokenString,
        },
        'SkillPackage': {
          'Overrides': Match.absent(),
        },
      }));
    });

    test('does not create Custom Resources', () => {
      template.resourceCountIs('AWS::CloudFormation::CustomResource', 0);
      template.resourceCountIs('Custom::AWS', 0);
    });

    test('does not create a Lambda Permission', () => {
      template.resourceCountIs('AWS::Lambda::Permission', 0);
    });
  });

  describe('created with SSM SecureString SecretValue for lwaClientSecret', () => {
    test('results in a validation error', () => {
      const customProps = {
        lwaClientSecret: cdk.SecretValue.ssmSecure(DummyAlexaDeveloperClientSecretString, '1'),
        lwaRefreshToken: cdk.SecretValue.secretsManager(DummyAlexaDeveloperRefreshTokenString),
      };

      expect(() => new as.Skill(stack, 'Skill', createTestSkillProps(stack, false, customProps)))
        .toThrowError(
          /Invalid prop: lwaClientSecret; SSM SecureString is not supported. Use Secrets Manager secret instead./,
        );
    });
  });

  describe('created with SSM SecureString SecretValue for lwaRefreshToken', () => {
    test('results in a validation error', () => {
      const customProps = {
        lwaClientSecret: cdk.SecretValue.secretsManager(DummyAlexaDeveloperClientSecretString),
        lwaRefreshToken: cdk.SecretValue.ssmSecure(DummyAlexaDeveloperRefreshTokenString, '1'),
      };

      expect(() => new as.Skill(stack, 'Skill', createTestSkillProps(stack, false, customProps)))
        .toThrowError(
          /Invalid prop: lwaRefreshToken; SSM SecureString is not supported. Use Secrets Manager secret instead./,
        );
    });
  });

  describe('imported by skill ID', () => {
    test('has the same skill ID as it was imported with', () => {
      const skillId = 'amzn1.ask.skill.abcdef12-3456-7890-abcd-ef1234567890';
      const skill = as.Skill.fromSkillId(stack, 'Skill', skillId);
      expect(skill.skillId).toEqual(skillId);
    });
  });
});