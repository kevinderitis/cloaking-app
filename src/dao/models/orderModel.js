import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'underpaid'],
        required: true,
        default: 'pending',
    },
    attempts: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;