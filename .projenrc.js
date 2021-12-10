/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-alexa-skill',
  description: 'A construct library for deploying Alexa Skills with the AWS CDK.',
  authorName: 'Jeff Gardner',
  majorVersion: 2,
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  repositoryUrl: 'https://github.com/aws-samples/cdk-alexa-skill',
  licensed: false,
  gitignore: ['.DS_Store', '!/LICENSE'],
  npmignore: ['/example'],
  keywords: [
    'aws-cdk',
    'alexa',
    'skill',
    'echo',
    'amazon',
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
