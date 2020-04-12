import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import config = require('@aws-cdk/aws-config');
import { ManagedPolicy } from '@aws-cdk/aws-iam';

export class Mgt312ConfigRuleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Config rule triggered by SSM unmanaged EC2 instances
    const managedRule = new config.ManagedRule(this, 'ManagedRule', {
      identifier: 'EC2_INSTANCE_MANAGED_BY_SSM',
      configRuleName: 'mgt312-ec2-instance-managed-by-ssm'
    });

    // Create role used for auto remediation
    const autoRemediationRole = new iam.Role(this, 'AutoRemediationRole', {
      assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal("ec2.amazonaws.com"),
          new iam.ServicePrincipal("events.amazonaws.com"),
          new iam.ServicePrincipal("ssm.amazonaws.com"),
      )
    });
    autoRemediationRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonSSMAutomationRole'));

    // Create remediation terminating SSM unmanaged EC2 instances
    const remediation = new config.CfnRemediationConfiguration(this, "RuleRemediation", {
      configRuleName: managedRule.configRuleName,
      targetId: "AWS-TerminateEC2Instance",
      targetType: "SSM_DOCUMENT",
      targetVersion: "1",
      automatic: true,
      maximumAutomaticAttempts: 3,
      retryAttemptSeconds: 60,
      parameters: {
        AutomationAssumeRole: {
          StaticValue: {
            Values: [
              autoRemediationRole.roleArn
            ]
          }
        },
        InstanceId: {
          ResourceValue: {
            Value: "RESOURCE_ID"
          }
        }
      }
    })
  }
}
