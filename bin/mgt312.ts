#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Mgt312CloudTrailStack } from '../lib/mgt312-cloudtrail';
import { Mgt312ConfigRuleStack } from '../lib/mgt312-config-rule';
import { Mgt312CfEC2Stack } from '../lib/mgt312-cf-ec2';
import { Mgt312SSMStack } from '../lib/mgt312-ssm';
import {Mgt312ServiceCatalogStack} from '../lib/mgt312-servicecatalog';

const app = new cdk.App();
new Mgt312CloudTrailStack(app, 'Mgt312CloudTrailStack');

new Mgt312ConfigRuleStack(app, 'Mgt312ConfigRuleStack');

new Mgt312CfEC2Stack(app, 'Mgt312CfEC2Stack');

new Mgt312SSMStack(app, 'Mgt312SSMStack');

new Mgt312ServiceCatalogStack(app, 'Mgt312ServiceCatalogStack');
