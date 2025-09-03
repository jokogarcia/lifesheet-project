#!/bin/bash
BRANCHNAME="${1:-master}"
ssh -p 2907 quin@irazu.zapto.org "cd repos/lifesheet-project/scripts && bash self-deploy-dev.sh $BRANCHNAME"