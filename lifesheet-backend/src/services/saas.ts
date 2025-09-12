import { SaaSPlan, SaaSSubscription } from '../models/saaS-plan.model';
import { Consumption } from '../models/consumption.model';

export async function checkUserCanDoOperation(userId: string) {
  const activeSubscription = await _getUsersActiveSubscription(userId);
  const activePlan = await SaaSPlan.findById(activeSubscription.planId);
  const { todaysConsumptions, thisWeeksConsumptions } = await getUsersConsumptions(userId);
  if (!activePlan) {
    return {
      canOperate: false,
      reason: 'No active plan',
    };
  }
  if (todaysConsumptions >= activePlan.dailyRateLimit) {
    return {
      canOperate: false,
      reason: 'Daily limit reached',
    };
  }
  if (thisWeeksConsumptions >= activePlan.weeklyRateLimit) {
    return {
      canOperate: false,
      reason: 'Weekly limit reached',
    };
  }
  return {
    canOperate: true,
  };
}
export async function _getUsersActiveSubscription(userId: string) {
  const now = new Date();
  const subscriptions = await SaaSSubscription.find({
    userId,
    startDate: { $lt: now },
    endDate: { $gt: now },
    status: 'active',
  });
  if (subscriptions.length === 0) {
    //Assign free plan
    const freePlan = await SaaSPlan.findOne({ name: 'Free Plan' });
    if (!freePlan) {
      throw new Error('Free plan not found');
    }
    const newSubscription = new SaaSSubscription({
      userId,
      planId: freePlan._id,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active',
    });
    await newSubscription.save();
    return newSubscription;
  } else if (subscriptions.length > 1) {
    // Use the most recent
    const mostRecent = subscriptions.reduce((prev, curr) => {
      return prev.startDate > curr.startDate ? prev : curr;
    });
    return mostRecent;
  }
  return subscriptions[0];
}
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}
function isSameWeek(d1: Date, d2: Date) {
  const startOfWeek1 = new Date(d1);
  startOfWeek1.setUTCDate(d1.getUTCDate() - d1.getUTCDay());
  startOfWeek1.setUTCHours(0, 0, 0, 0);

  const startOfWeek2 = new Date(d2);
  startOfWeek2.setUTCDate(d2.getUTCDate() - d2.getUTCDay());
  startOfWeek2.setUTCHours(0, 0, 0, 0);

  return startOfWeek1.getTime() === startOfWeek2.getTime();
}
export async function getUsersConsumptions(userId: string) {
  const now = new Date();
  const usersConsumptions = await Consumption.find({ userId });
  //User's consumption's from today UTC

  const todaysConsumptions = usersConsumptions.filter(consumption => {
    return isSameDay(consumption.createdAt, now);
  });
  const thisWeeksConsumptions = usersConsumptions.filter(consumption => {
    return isSameWeek(consumption.createdAt, now);
  });
  return {
    usersConsumptions,
    todaysConsumptions: todaysConsumptions.length,
    thisWeeksConsumptions: thisWeeksConsumptions.length,
  };
}
export async function setSubscriptionActive(subscriptionId: string) {
  const subscription = await SaaSSubscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  const plan = await SaaSPlan.findById(subscription.planId);
  if (!plan) {
    throw new Error('Plan not found');
  }
  const startTimestamp = new Date().getTime();
  const endTimestamp = startTimestamp + plan.days * 24 * 60 * 60 * 1000;
  subscription.startDate = new Date(startTimestamp);
  subscription.endDate = new Date(endTimestamp);
  subscription.status = 'active';

  await subscription.save();
}
export async function setSubscriptionPaymentFailed(subscriptionId: string) {
  const subscription = await SaaSSubscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  subscription.status = 'payment-failed';
  await subscription.save();
}
