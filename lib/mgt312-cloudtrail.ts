import * as cdk from '@aws-cdk/core';
import cloudtrail = require('@aws-cdk/aws-cloudtrail');
import { RemovalPolicy } from '@aws-cdk/core';
import { AutoDeleteBucket } from '@mobileposse/auto-delete-bucket';

export class Mgt312CloudTrailStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const trailBucket = new AutoDeleteBucket(this, 'CloudTrailBucket', {
      bucketName: 'mgt312-workshop-cloudtrail-bucket',
      removalPolicy: RemovalPolicy.DESTROY
    });

    const trail = new cloudtrail.Trail(this, 'CloudTrail', {
      trailName: 'mgt312-workshop',
      bucket: trailBucket,
      includeGlobalServiceEvents: true,
      enableFileValidation: true,
      isMultiRegionTrail: true,
      managementEvents: cloudtrail.ReadWriteType.ALL,
      sendToCloudWatchLogs: true
    });

    trail.addS3EventSelector(["arn:aws:s3:::"], {
      includeManagementEvents: true,
      readWriteType: cloudtrail.ReadWriteType.ALL
    });

  }
}
