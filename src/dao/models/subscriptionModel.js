import mongoose from 'mongoose';

const { Schema } = mongoose;

const subscriptionSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    plan: {
        type: String,
        enum: ['trial', 'basic', 'premium'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;