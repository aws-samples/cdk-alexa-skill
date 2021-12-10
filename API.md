# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### Skill <a name="cdk-alexa-skill.Skill"></a>

- *Implements:* [`cdk-alexa-skill.ISkill`](#cdk-alexa-skill.ISkill)

Defines an Alexa Skill.

#### Initializer <a name="cdk-alexa-skill.Skill.Initializer"></a>

```typescript
import { Skill } from 'cdk-alexa-skill'

new Skill(scope: Construct, id: string, props: SkillProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.scope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.props"></a>

- *Type:* [`cdk-alexa-skill.SkillProps`](#cdk-alexa-skill.SkillProps)

---


#### Static Functions <a name="Static Functions"></a>

##### `fromSkillId` <a name="cdk-alexa-skill.Skill.fromSkillId"></a>

```typescript
import { Skill } from 'cdk-alexa-skill'

Skill.fromSkillId(scope: Construct, id: string, skillId: string)
```

###### `scope`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.scope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

###### `id`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.id"></a>

- *Type:* `string`

---

###### `skillId`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.skillId"></a>

- *Type:* `string`

---

#### Properties <a name="Properties"></a>

##### `skillId`<sup>Required</sup> <a name="cdk-alexa-skill.Skill.skillId"></a>

- *Type:* `string`

The Skill ID of this Alexa Skill.

---


## Structs <a name="Structs"></a>

### SkillProps <a name="cdk-alexa-skill.SkillProps"></a>

Construction properties for an Alexa Skill object.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { SkillProps } from 'cdk-alexa-skill'

const skillProps: SkillProps = { ... }
```

##### `alexaVendorId`<sup>Required</sup> <a name="cdk-alexa-skill.SkillProps.alexaVendorId"></a>

- *Type:* `string`

Vendor ID associated with Alexa Developer account.

---

##### `lwaClientId`<sup>Required</sup> <a name="cdk-alexa-skill.SkillProps.lwaClientId"></a>

- *Type:* `string`

Client ID of Login with Amazon (LWA) Security Profile.

---

##### `lwaClientSecret`<sup>Required</sup> <a name="cdk-alexa-skill.SkillProps.lwaClientSecret"></a>

- *Type:* [`aws-cdk-lib.SecretValue`](#aws-cdk-lib.SecretValue)

Client secret associated with Login with Amazon (LWA) Client ID.

---

##### `lwaRefreshToken`<sup>Required</sup> <a name="cdk-alexa-skill.SkillProps.lwaRefreshToken"></a>

- *Type:* [`aws-cdk-lib.SecretValue`](#aws-cdk-lib.SecretValue)

Refresh token associated with Login with Amazon (LWA) Security Profile.

---

##### `skillPackagePath`<sup>Required</sup> <a name="cdk-alexa-skill.SkillProps.skillPackagePath"></a>

- *Type:* `string`

The relative path to the skill package directory containing all configuration files for the Alexa Skill.

---

##### `endpointLambdaFunction`<sup>Optional</sup> <a name="cdk-alexa-skill.SkillProps.endpointLambdaFunction"></a>

- *Type:* [`aws-cdk-lib.aws_lambda.IFunction`](#aws-cdk-lib.aws_lambda.IFunction)
- *Default:* No endpoint Lambda Function

The Lambda Function to be configured as the endpoint for the Alexa Skill.

---


## Protocols <a name="Protocols"></a>

### ISkill <a name="cdk-alexa-skill.ISkill"></a>

- *Extends:* [`aws-cdk-lib.IResource`](#aws-cdk-lib.IResource)

- *Implemented By:* [`cdk-alexa-skill.Skill`](#cdk-alexa-skill.Skill), [`cdk-alexa-skill.ISkill`](#cdk-alexa-skill.ISkill)

An Alexa Skill, either managed by this CDK app, or imported.


#### Properties <a name="Properties"></a>

##### `node`<sup>Required</sup> <a name="cdk-alexa-skill.ISkill.node"></a>

- *Type:* [`constructs.Node`](#constructs.Node)

The tree node.

---

##### `env`<sup>Required</sup> <a name="cdk-alexa-skill.ISkill.env"></a>

- *Type:* [`aws-cdk-lib.ResourceEnvironment`](#aws-cdk-lib.ResourceEnvironment)

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="cdk-alexa-skill.ISkill.stack"></a>

- *Type:* [`aws-cdk-lib.Stack`](#aws-cdk-lib.Stack)

The stack in which this resource is defined.

---

##### `skillId`<sup>Required</sup> <a name="cdk-alexa-skill.ISkill.skillId"></a>

- *Type:* `string`

The ID associated with this Skill.

---

