/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  name: 'cdk-alexa-skill',
  description: 'A construct library for deploying Alexa Skills with the AWS CDK.',
  authorName: 'Jeff Gardner',
  majorVersion: 1,
  cdkVersion: '1.110.1',
  cdkDependenciesAsDeps: false,
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  repositoryUrl: 'https://github.com/aws-samples/cdk-alexa-skill',
  licensed: false,
  gitignore: ['.DS_Store', '!/LICENSE'],
  npmignore: ['/example'],
  keywords: [
    'alexa',
    'skill',
    'echo',
    'amazon',
  ],
  cdkDependencies: [
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-python',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-s3-assets',
    '@aws-cdk/custom-resources',
    '@aws-cdk/alexa-ask',
    '@aws-cdk/core',
  ],
  publishToPypi: {
    distName: 'cdk-alexa-skill',
    module: 'cdk_alexa_skill',
  },
});

project.addFields({
  awslint: {
    exclude: [
      'props-physical-name:cdk-alexa-skill.SkillProps',
    ],
  },
  license: 'MIT-0',
});


project.synth();
