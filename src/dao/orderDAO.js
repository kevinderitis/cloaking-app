import Order from './models/orderModel.js';

export const getOrdersByUserId = async (userId) => {
    try {
        return await Order.find({ userId });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

export const getOrderByTransactionHash = async (transactionHash) => {
    try {
        return await Order.findOne({ transactionHash });
    } catch (error) {
        throw new Error('Error fetching order: ' + error.message);
    }
};

export const createNewOrder = async (orderData) => {
    try {
        const newOrder = new Order(orderData);
        await newOrder.save();
        return newOrder;
    } catch (error) {
        throw new Error('Error creating order: ' + error.message);
    }
};

export const updateOrderStatus = async (transactionHash, status) => {
    try {
        const order = await Order.findOne({ transactionHash });

        if (!order) {
            throw new Error('Order not found.');
        }

        order.status = status;
        await order.save();
        return order;
    } catch (error) {
        throw new Error('Error updating order: ' + error.message);
    }
};

export const removeOrder = async (transactionHash) => {
    try {
        const order = await Order.findOne({ transactionHash });

        if (!order) {
            throw new Error('Order not found or you do not have permission to delete it.');
        }

        await Order.deleteOne({ _id: order._id });
        return order;
    } catch (error) {
        throw new Error('Error deleting order: ' + error.message);
    }
};

export const getPendingOrdersByUserId = async (userId) => {
    try {
        return await Order.find({ userId, status: 'pending' });
    } catch (error) {
        throw new Error('Error fetching pending orders: ' + error.message);
    }
};

export const incrementAttempts = async (transactionHash) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { transactionHash },
            { $inc: { attempts: 1 } },
            { new: true }
        );

        if (!updatedOrder) {
            throw new Error('No se encontró la orden para incrementar intentos.');
        }

        return updatedOrder;
    } catch (error) {
        console.error('Error al incrementar los intentos de la orden:', error);
        throw error;
    }
};