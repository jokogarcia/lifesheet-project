import { SaaSPlan, SaaSSubscription } from "../models/saaS-plan.model";
import { Consumption } from "../models/consumption.model";

export async function checkUserCanDoOperation(userId: string) {
    const activeSubscription = await _getUsersActiveSubscription(userId);
    const activePlan = await SaaSPlan.findById(activeSubscription.planId);
    const { todaysConsumptions, thisWeeksConsumptions } = await getUsersConsumptions(userId);
    if (!activePlan) {
        return {
            canOperate: false,
            reason: "No active plan"
        }
    } if (todaysConsumptions >= activePlan.dailyRateLimit) {
        return {
            canOperate: false,
            reason: "Daily limit reached"
        }
    } if (thisWeeksConsumptions >= activePlan.weeklyRateLimit) {
        return {
            canOperate: false,
            reason: "Weekly limit reached"
        }
    }
    return {
        canOperate: true
    }
}
export async function _getUsersActiveSubscription(userId: string) {
    const now = new Date();
    const subscriptions = await SaaSSubscription.find({
        userId,
        startDate: { $lt: now },
        endDate: { $gt: now },
        status: 'active'
    })
    if (subscriptions.length === 0) {
        //Assign free plan
        const freePlan = await SaaSPlan.findOne({ name: "Free Plan" });
        if (!freePlan) {
            throw new Error('Free plan not found');
        }
        const newSubscription = new SaaSSubscription({
            userId,
            planId: freePlan._id,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active'
        });
        await newSubscription.save();
        return newSubscription;
    } else if (subscriptions.length > 1) {
        // Use the most recent
        const mostRecent = subscriptions.reduce((prev, curr) => {
            return (prev.startDate > curr.startDate) ? prev : curr;
        });
        return mostRecent;
    }
    return subscriptions[0];
}
export async function getUsersConsumptions(userId: string) {
    const now = new Date();
    const usersConsumptions = await Consumption.find({ userId });
    //User's consumption's from today UTC
    const todaysConsumptions = usersConsumptions.filter(consumption => {
        const todayMidnight = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');
        const consumptionDateUTC = new Date(consumption.createdAt.toISOString().split('T')[0] + 'T00:00:00Z');
        return consumptionDateUTC === todayMidnight;
    });
    const thisWeeksConsumptions = usersConsumptions.filter(consumption => {
        const consumptionDateUTC = new Date(consumption.createdAt.toISOString().split('T')[0] + 'T00:00:00Z');
        const todayUTC = new Date(now.toISOString().split('T')[0] + 'T00:00:00Z');
        const startOfWeek = new Date(todayUTC);
        startOfWeek.setDate(todayUTC.getDate() - todayUTC.getDay());
        return consumptionDateUTC >= startOfWeek;
    });
    return {
        usersConsumptions,
        todaysConsumptions: todaysConsumptions.length,
        thisWeeksConsumptions: thisWeeksConsumptions.length
    }
}

