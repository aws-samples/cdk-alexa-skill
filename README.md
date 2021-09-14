
# Alexa Skill CDK Construct

This is a CDK construct library for creating an Alexa Skill.

This library currently supports NodeJS and Python.


## Installation 

Install with npm

```bash 
$ npm install cdk-alexa-skill
```
    
Install with pip

```bash 
$ pip install cdk-alexa-skill
```
    
## Usage/Examples

#### TypeScript:
```javascript
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { Skill } from 'cdk-alexa-skill';

const skillBackendLambdaFunction = new lambda.Function(this, 'Function', {
    ...
});

const skill = new Skill(this, 'Skill', {
    endpointLambdaFunction: skillBackendLambdaFunction, // @aws-cdk/aws-lambda.IFunction object containing backend code for the Alexa Skill
    skillPackagePath: 'src/skill-package', // path to your skill package
    alexaVendorId: 'XXXXXXXXXX', // vendor ID of Alexa Developer account
    lwaClientId: 'XXXXXXXXXX', // client ID of LWA Security Profile
    lwaClientSecret: cdk.SecretValue.secretsManager('lwa-client-secret'), // @aws-cdk/core.SecretValue object containing client secret of LWA Security Profile
    lwaRefreshToken: cdk.SecretValue.secretsManager('lwa-refresh-token') // @aws-cdk/core.SecretValue object containing refresh token of LWA Security Profile
});
```

#### Python:
```python
from aws_cdk import core
from aws_cdk import aws_lambda as lambda_
from cdk_alexa_skill import Skill

skill_backend_lambda_function = lambda_.Function(self, 'Function',
    ...)

skill = Skill(self, 'Skill',
    endpoint_lambda_function=skill_backend_lambda_function, # aws_cdk.aws_lambda.IFunction object containing backend code for the Alexa Skill
    skill_package_path='src/skill_package', # path to your skill package
    alexa_vendor_id='XXXXXXXXXX', # vendor ID of Alexa Developer account
    lwa_client_id='XXXXXXXXXX', # client ID of LWA Security Profile
    lwa_client_secret=core.SecretValue.secrets_manager('lwa-client-secret'), # @aws-cdk/core.SecretValue object containing client secret of LWA Security Profile
    lwa_refresh_token=core.SecretValue.secrets_manager('lwa-refresh-token')) # @aws-cdk/core.SecretValue object containing refresh token of LWA Security Profile
```

See [example folder](./example) or [this blog post](https://aws.amazon.com/blogs/devops/deploying-alexa-skills-with-aws-cdk/) for a more complete example.
## Contributing

Contributions of all kinds are welcome and celebrated. Raise an issue, submit a PR, do the right thing.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contributing guidelines.


## License

  [MIT](./LICENSE)