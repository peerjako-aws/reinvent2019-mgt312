#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Mgt312Stack } from '../lib/mgt312-stack';

const app = new cdk.App();
new Mgt312Stack(app, 'Mgt312Stack');
