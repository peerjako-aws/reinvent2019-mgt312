import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Mgt312 = require('../lib/mgt312-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Mgt312.Mgt312Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
