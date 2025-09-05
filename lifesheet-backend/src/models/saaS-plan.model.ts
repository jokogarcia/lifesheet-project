import mongoose, { Schema, Document } from 'mongoose';
const minPlanVersion = 1;
export interface ISaaSPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  days: number; //Number of days the plan is valid for
  description: string;
  priceCents: number;
  currency: string;
  iconUrl: string;
  features: string[];
  dailyRateLimit: number; //-1 for unlimited
  weeklyRateLimit: number; //-1 for unlimited
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version?: number;
}

const SaaSPlanSchema: Schema = new Schema({
  name: { type: String, required: true },
  days: { type: Number, required: true, default: 30 },
  description: { type: String, required: true },
  priceCents: { type: Number, required: true },
  currency: { type: String, required: true },
  iconUrl: { type: String, required: true },
  features: { type: [String], required: true },
  dailyRateLimit: { type: Number, required: true },
  weeklyRateLimit: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  deletedAt: { type: Date, default: null },
  version: { type: Number, default: 0 },
});

export interface ISaasSubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paused' | 'canceled' | 'payment-pending' | 'payment-failed';
}
const SaasSubscriptionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'paused', 'canceled', 'payment-pending', 'payment-failed'],
    required: true,
    default: 'payment-pending',
  },
});

export const SaaSPlan = mongoose.model<ISaaSPlan>('SaaSPlan', SaaSPlanSchema);
export const SaaSSubscription = mongoose.model<ISaasSubscription>(
  'SaaSSubscription',
  SaasSubscriptionSchema
);
export async function getActivePlans() {
  return SaaSPlan.find({ deletedAt: null, version: { $exists: true, $gte: minPlanVersion } });
}
//Initial seed
async function initialSeed() {
  const now = new Date();
  await SaaSPlan.updateMany({ version: { $exists: false } }, { $set: { version: 0 } });
  const numberOfExistingPlans = await SaaSPlan.find({
    version: { $exists: true, $gte: minPlanVersion },
  }).countDocuments();
  if (numberOfExistingPlans === 0) {
    console.log('Seeding initial SaaS plans...');
    await SaaSPlan.create([
      {
        name: 'Free Plan',
        description: 'Zero Cost plan for everybody',
        priceCents: 0,
        currency: 'EUR',
        iconUrl: 'plan-basic.png',
        features: [
          'Unlimited export PDF documents',
          'Unlimited manual edits of your PDFs',
          'Supported by ads',
          'Up to 10 Profile pictures uploaded to the site at one time.',
          'Up to 3 AI Enhanced operations per day',
          'Up to 10 AI Enhanced operations per week',
          'Rate limits restart at midnight UTC',
          'Weekly limits reset every Monday at midnight UTC',
        ],
        days: 365,
        dailyRateLimit: 3,
        weeklyRateLimit: 10,
        version: minPlanVersion,
      },

      {
        name: 'Premium Plan 30',
        description:
          'Contribute to the project and get a much more AI Operations for tailoring your CVs and generating Cover Letters.',
        priceCents: 499,
        days: 30,
        currency: 'EUR',
        iconUrl: 'plan-premium.png',
        features: [
          'Unlimited export PDF documents',
          'Unlimited manual edits of your PDFs',
          'No Ads!',
          'Up to 50 Profile pictures uploaded to the site at one time.',
          'Up to 50 AI Enhanced operations per day',
          'Up to 500 AI Enhanced operations per week',
          'Rate limits restart at midnight UTC',
          'Weekly limits reset every Monday at midnight UTC',
          'Price is for 30 days, no auto-renewal',
          'Cancel anytime',
        ],
        dailyRateLimit: 50,
        weeklyRateLimit: 500,
        version: minPlanVersion,
      },
      {
        name: 'Premium Plan 365',
        description: 'Commit to a full year and enjoy a hefty discount.',
        priceCents: 4999,
        days: 365,
        currency: 'EUR',
        iconUrl: 'plan-premium-365.png',
        features: [
          'Unlimited export PDF documents',
          'Unlimited manual edits of your PDFs',
          'No Ads!',
          'Up to 50 Profile pictures uploaded to the site at one time.',
          'Up to 50 AI Enhanced operations per day',
          'Up to 500 AI Enhanced operations per week',
          'Rate limits restart at midnight UTC',
          'Weekly limits reset every Monday at midnight UTC',
          'Price is for 365 days, no auto-renewal',
          'Cancel anytime',
        ],
        dailyRateLimit: 50,
        weeklyRateLimit: 500,
        version: minPlanVersion,
      },
    ]);
    console.log('Seeding complete.');
  }
}
initialSeed().catch(err => {
  console.error('Error seeding initial data:', err);
});
