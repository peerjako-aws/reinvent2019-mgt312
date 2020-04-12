import * as cdk from '@aws-cdk/core';
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import { AutoDeleteBucket } from '@mobileposse/auto-delete-bucket';

import logs = require('@aws-cdk/aws-logs');
import { Tag, Stack, RemovalPolicy } from '@aws-cdk/core';
import { ManagedPolicy } from '@aws-cdk/aws-iam';

export class Mgt312CfEC2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC Flow Log Destinations
    const flowlogBucket = new AutoDeleteBucket(this, 'FlowLogBucket', {
        bucketName: 'mgt312-workshop-flowlogs-bucket',
        removalPolicy: RemovalPolicy.DESTROY
    });
    
    const flowlogCWLogGroup = new logs.LogGroup(this, 'FlowlogLogGroup', {
        logGroupName: 'mgt312/vpcflowlogsrejected',
        removalPolicy: RemovalPolicy.DESTROY
    });

    // Create standard VPC
    const vpc = new ec2.Vpc(this, 'Vpc');

    // and add VPC Flow Log
    vpc.addFlowLog('FlowLogS3', {
        destination: ec2.FlowLogDestination.toS3(flowlogBucket)
    });
      
    vpc.addFlowLog('FlowLogCloudWatch', {
        trafficType: ec2.FlowLogTrafficType.REJECT,
        destination: ec2.FlowLogDestination.toCloudWatchLogs(flowlogCWLogGroup)
    });

    // Create security group with http access
    const sg = new ec2.SecurityGroup(this, 'SecurityGroup', {
        vpc: vpc,
        description: 'Allow http access to ec2 instances from anywhere',
        allowAllOutbound: true
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow public http access');

    // Create EC2 instance role for SSM managed intances
    const ec2Role = new iam.Role(this, 'Ec2InstanceRole', {
        assumedBy: new iam.CompositePrincipal(
            new iam.ServicePrincipal("ec2.amazonaws.com"),
            new iam.ServicePrincipal("ssm.amazonaws.com"),
        )
    });

    ec2Role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    ec2Role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));

    const region = Stack.of(this).region;
    ec2Role.addToPolicy(new iam.PolicyStatement({
        actions: [
          's3:GetObject'
        ],
        resources: [
            `arn:aws:s3:::aws-ssm-${region}/*`,
            `arn:aws:s3:::aws-windows-downloads-${region}/*`,
            `arn:aws:s3:::amazon-ssm-${region}/*`,
            `arn:aws:s3:::amazon-ssm-packages-${region}/*`,
            `arn:aws:s3:::${region}-birdwatcher-prod/*`,
            `arn:aws:s3:::patch-baseline-snapshot-${region}/*`,
            ],
    }));

    // Create SSM managed EC2 instance using the latest AMAZON LINUX AMI
    const awsAMI = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 });

    const ec2Instance = new ec2.Instance(this, 'Instance', {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
        machineImage: awsAMI,
        securityGroup: sg,
        role: ec2Role,
        vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC}
    });
    Tag.add(ec2Instance, 'Name', 'MGMT312-EC2');

    // Create SSM unmanaged EC2 instance using the latest AMAZON LINUX AMI
    const ec2InstanceUnmanaged = new ec2.Instance(this, 'InstanceUnmanaged', {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
        machineImage: awsAMI,
        securityGroup: sg,
        vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC}
    });
    Tag.add(ec2InstanceUnmanaged, 'Name', 'MGMT312-EC2-UNMANAGED');

    new cdk.CfnOutput(this, "EC2InstancePublicDnsName", {value: ec2Instance.instancePublicDnsName });

  }
}