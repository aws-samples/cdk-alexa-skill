/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as path from 'path';
import * as ask from '@aws-cdk/alexa-ask';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as assets from '@aws-cdk/aws-s3-assets';
import * as cdk from '@aws-cdk/core';
import * as customResources from '@aws-cdk/custom-resources';

const ALEXA_SERVICE_PRINCIPAL = 'alexa-appkit.amazon.com';
const BACKEND_LAMBDA_PERMISSION_ACTION = 'lambda:InvokeFunction';

/**
 * An Alexa Skill, either managed by this CDK app, or imported.
 */
export interface ISkill extends cdk.IResource {
  /**
   * The ID associated with this Skill.
   *
   * @attribute
   */
  readonly skillId: string;
};

abstract class SkillBase extends cdk.Resource implements ISkill {
  public abstract readonly skillId: string;
};

/**
 * Construction properties for an Alexa Skill object
 */
export interface SkillProps {
  /**
   * The Lambda Function to be configured as the endpoint for the Alexa Skill.
   *
   * @default - No endpoint Lambda Function
   */
  readonly endpointLambdaFunction?: lambda.IFunction;

  /**
   * The relative path to the skill package directory containing all configuration files for the Alexa Skill.
   */
  readonly skillPackagePath: string;

  /**
   * Vendor ID associated with Alexa Developer account.
   */
  readonly alexaVendorId: string;

  /**
   * Client ID of Login with Amazon (LWA) Security Profile.
   */
  readonly lwaClientId: string;

  /**
   * Client secret associated with Login with Amazon (LWA) Client ID.
   */
  readonly lwaClientSecret: cdk.SecretValue;

  /**
   * Refresh token associated with Login with Amazon (LWA) Security Profile.
   */
  readonly lwaRefreshToken: cdk.SecretValue;
};

/**
 * Defines an Alexa Skill.
 *
 * @resource Alexa::ASK::Skill
 */
export class Skill extends SkillBase {
  /**
   * Reference an existing Skill,
   * defined outside of the CDK code, by Skill ID.
   */
  public static fromSkillId(scope: cdk.Construct, id: string, skillId: string): ISkill {
    class Import extends SkillBase {
      public readonly skillId = skillId;
    }
    return new Import(scope, id);
  }

  /**
     * The Skill ID of this Alexa Skill
     */
  public readonly skillId: string;

  constructor(scope: cdk.Construct, id: string, props: SkillProps) {
    // Validate that SSM SecureString was not supplied--Alexa::ASK::Skill does not support SSM SecureString references.
    const resolvedClientSecret = cdk.Tokenization.resolve(props.lwaClientSecret, {
      scope,
      resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
    });
    const resolvedRefreshToken = cdk.Tokenization.resolve(props.lwaRefreshToken, {
      scope,
      resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
    });
    if (resolvedClientSecret.includes('ssm-secure')) {
      throw new Error('Invalid prop: lwaClientSecret; SSM SecureString is not supported. Use Secrets Manager secret instead.');
    }
    if (resolvedRefreshToken.includes('ssm-secure')) {
      throw new Error('Invalid prop: lwaRefreshToken; SSM SecureString is not supported. Use Secrets Manager secret instead.');
    }

    super(scope, id);

    // Role giving CfnSkill resource read-only access to skill package asset in S3.
    const askResourceRole = new iam.Role(this, 'AskResourceRole', {
      assumedBy: new iam.ServicePrincipal(ALEXA_SERVICE_PRINCIPAL),
    });

    // Skill package S3 asset.
    const skillPackageAsset = new assets.Asset(this, 'SkillPackageAsset', {
      path: props.skillPackagePath,
      readers: [askResourceRole],
    });

    // Alexa Skill with override that injects the endpoint Lambda Function in the skill manifest.
    const resource: ask.CfnSkill = new ask.CfnSkill(this, 'Resource', {
      vendorId: props.alexaVendorId,
      skillPackage: {
        s3Bucket: skillPackageAsset.s3BucketName,
        s3Key: skillPackageAsset.s3ObjectKey,
        s3BucketRole: askResourceRole.roleArn,
        ...props.endpointLambdaFunction && { // Only add overrides property if endpointLambdaFunction prop was supplied.
          overrides: {
            manifest: {
              apis: {
                custom: {
                  endpoint: {
                    uri: props.endpointLambdaFunction?.functionArn,
                  },
                },
              },
            },
          },
        },
      },
      authenticationConfiguration: {
        clientId: props.lwaClientId,
        clientSecret: props.lwaClientSecret.toString(),
        refreshToken: props.lwaRefreshToken.toString(),
      },
    });
    // Set resource skillId to Alexa Skill resource Skill ID.
    this.skillId = resource.ref;

    // This section is only necessary if a Lambda Function was supplied in the props.
    if (props.endpointLambdaFunction) {
      // Create placeholder Lambda Permission to allow Alexa Skill to pass endpoint validation.
      // Permission will be replaced with another containing event source validation after Alexa Skill is created.
      const initialLambdaPermission = new lambda.CfnPermission(this, 'InitialLambdaPermission', {
        functionName: props.endpointLambdaFunction.functionArn,
        principal: ALEXA_SERVICE_PRINCIPAL,
        action: BACKEND_LAMBDA_PERMISSION_ACTION,
      });

      // Skill must be created after the initial Lambda Permission resource is in place to prevent endpoint validation errors.
      resource.addDependsOn(initialLambdaPermission);

      // Lambda Function that retrieves the StatementId of the initial Lambda Permission for use by other custom resources.
      const getPermissionStatementIdFunction = new lambda.Function(this, 'GetLambdaPermissionStatementIdFunction', {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: 'index.lambda_handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../custom-resource-runtime/get-lambda-permission-statement-id-handler')),
        initialPolicy: [
          new iam.PolicyStatement({
            actions: ['lambda:GetPolicy'],
            resources: [props.endpointLambdaFunction.functionArn],
          }),
        ],
      });

      // Custom resource for managing lifecycle of GetLambdaPermissionStatementIdFunction Lambda Function.
      const getPermissionStatementIdCustomResource = new cdk.CustomResource(this, 'GetLambdaPermissionStatementIdCustomResource', {
        serviceToken: new customResources.Provider(this, 'Provider', { onEventHandler: getPermissionStatementIdFunction }).serviceToken,
        properties: {
          lambda_function_arn: props.endpointLambdaFunction.functionArn,
          service_principal_to_match: ALEXA_SERVICE_PRINCIPAL,
          action_to_match: BACKEND_LAMBDA_PERMISSION_ACTION,
        },
      });
      // Custom resource code must run after the initial Lambda Permission resource is in place.
      getPermissionStatementIdCustomResource.node.addDependency(initialLambdaPermission);
      // Get custom resource result for use by other custom resources.
      const permissionStatementId = getPermissionStatementIdCustomResource.getAttString('statement_id');

      // Policy for AwsCustomResource resources.
      const awsCustomResourcePolicy = customResources.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: [
            'lambda:RemovePermission',
            'lambda:AddPermission',
          ],
          resources: [props.endpointLambdaFunction.functionArn],
        }),
      ]);

      // SDK call to be used for RemovePermissionCustomResource.
      const removePermissionStatementSdkCall = {
        service: 'Lambda',
        action: 'removePermission',
        parameters: {
          FunctionName: props.endpointLambdaFunction.functionArn,
          StatementId: permissionStatementId,
        },
        ignoreErrorCodesMatching: 'ResourceNotFoundException', // Ignore if there is no matching Permission to remove.
        physicalResourceId: customResources.PhysicalResourceId.of(`RemovePermission-${this.skillId}`),
      };
      const removePermissionCustomResource = new customResources.AwsCustomResource(this, 'RemovePermissionCustomResource', {
        policy: awsCustomResourcePolicy,
        onCreate: removePermissionStatementSdkCall,
        onUpdate: removePermissionStatementSdkCall,
        onDelete: removePermissionStatementSdkCall,
      });
      // RemovePermissionCustomResource code must run after the Alexa Skill has been created to ensure the intial Lambda Permission is in place upon Alexa Skill creation.
      removePermissionCustomResource.node.addDependency(resource);

      // SDK call to be used for AddPermissionCustomResource.
      const addPermissionStatementSdkCall = {
        service: 'Lambda',
        action: 'addPermission',
        parameters: {
          FunctionName: props.endpointLambdaFunction.functionArn,
          StatementId: permissionStatementId,
          Principal: ALEXA_SERVICE_PRINCIPAL,
          Action: BACKEND_LAMBDA_PERMISSION_ACTION,
          EventSourceToken: this.skillId,
        },
        physicalResourceId: customResources.PhysicalResourceId.of(`AddPermission-${this.skillId}`),
      };
      const addPermissionCustomResource = new customResources.AwsCustomResource(this, 'AddPermissionCustomResource', {
        policy: awsCustomResourcePolicy,
        onCreate: addPermissionStatementSdkCall,
        onUpdate: addPermissionStatementSdkCall,
      });
        // AddPermissionCustomResource code must run after RemovePermissionCustomResource code has run to prevent attempts to create Permission with redundant StatementIds.
      addPermissionCustomResource.node.addDependency(removePermissionCustomResource);
    }
  }
};
