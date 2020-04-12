import * as cdk from '@aws-cdk/core';
import sc = require('@aws-cdk/aws-servicecatalog');
import assets = require('@aws-cdk/aws-s3-assets');
import fs = require('fs');
import path = require('path');

export class Mgt312ServiceCatalogStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
    
        const dir = path.join(__dirname, '../cfn_templates');
        const asset = new assets.Asset(this, 'CfnAsset', {
            path: path.join(dir, 'singleec2instance.yml')
        });

        const ec2LinuxProduct = new sc.CfnCloudFormationProduct(this, 'EC2LinuxProduct', {
            name: "SingleEC2Linux",
            description: "This is a single Amazon EC2 Linux Machine",
            owner: "peerjako-aws",
            provisioningArtifactParameters: [{
                info: {
                    LoadTemplateFromURL: asset.s3Url
                },
                description: "ec2 linux cloudformation",
                name: "v1"
            }]
        });

        const mgt312Portfolio = new sc.CfnPortfolio(this, 'MGT312Portfolio', {
            displayName: "MGT312 First Portfolio",
            providerName: "Company Admin",
            description: "First portfolio created in MGT312 workshop"
        });

        new sc.CfnPortfolioProductAssociation(this, 'PortfolioProductAssociation', {
            portfolioId: mgt312Portfolio.ref,
            productId: ec2LinuxProduct.ref
        });

        /*
        new sc.CfnPortfolioPrincipalAssociation(this, 'PortfolioPrincipalAssociation', {
            portfolioId: mgt312Portfolio.ref,
            principalArn: "",
            principalType: "IAM"
        });
*/
        
    }
}