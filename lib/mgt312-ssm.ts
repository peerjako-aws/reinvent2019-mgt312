import * as cdk from '@aws-cdk/core';
import { Document } from 'cdk-ssm-document';
import fs = require('fs');
import path = require('path');

export class Mgt312SSMStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
    
        const dir = path.join(__dirname, '../ssm_documents');
        const files = fs.readdirSync(dir);

        for (const i in files) {
            const name = files[i];
            const shortName = name.split('.').slice(0, -1).join('.'); // removes file extension
            const file = `${dir}/${name}`;

            new Document(this, `SSM-Document-${shortName}`, {
                name: shortName,
                content: fs.readFileSync(file).toString(),
                documentType: "Automation"
            });
        }
    }
}