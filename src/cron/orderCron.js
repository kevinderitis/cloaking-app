import cron from 'node-cron';
import axios from 'axios';
import { updateOrderStatus, incrementAttempts, getOrderByTransactionHash } from '../dao/orderDAO.js';
import { config } from '../config/config.js';
import { addSubscriptionPayment } from '../dao/subscriptionDAO.js';

const activeCronJobs = {};
const MAX_ATTEMPTS = 10;

export const startOrderVerificationCron = (orderId, transactionHash) => {
    if (activeCronJobs[orderId]) {
        console.log(`El cron job ya está corriendo para la orden ${orderId}`);
        return;
    }

    let attempts = 0;

    const job = cron.schedule('*/5 * * * *', async () => {
        try {
            attempts++;

            const payment = await checkPaymentTRC20(transactionHash);

            if (payment.status === 'confirmed') {
                let order = await getOrderByTransactionHash(transactionHash);

                if (parseFloat(payment.amount) >= parseFloat(order.amount)) {
                    await updateOrderStatus(transactionHash, 'completed');
                    await addSubscriptionPayment(order.userId, parseFloat(payment.amount));
                    console.log(`Payment confirmed for order: ${orderId}`);
                } else {
                    await updateOrderStatus(transactionHash, 'underpaid');
                    console.log(`Payment underpaid for order: ${orderId}`);
                }

                job.stop();
                delete activeCronJobs[orderId];
            } else if (payment.status === 'failed' || attempts >= MAX_ATTEMPTS) {
                await updateOrderStatus(transactionHash, 'failed');
                console.log(`Order ${orderId} max attempts failed.`);
                job.stop();
                delete activeCronJobs[orderId];
            } else {
                console.log(`Attempts ${attempts} for order ${orderId}`);
                await incrementAttempts(transactionHash);
            }
        } catch (error) {
            console.error(`Error verificando la orden ${orderId}:`, error);
        }
    });

    activeCronJobs[orderId] = job;
};

const getTransactionInfo = async (transactionHash) => {
    try {
        const response = await axios.get(`${config.TRONSCAN_API_BASE_URL}${transactionHash}`);

        const transactionInfo = response.data;

        if (transactionInfo) {
            return transactionInfo;
        } else {
            console.log('No transaction found.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching transaction info:', error);
        return null;
    }
}

const checkPaymentTRC20 = async (transactionHash) => {
    const transactionInfo = await getTransactionInfo(transactionHash);

    if (!transactionInfo) {
        return { status: 'pending', amount: 0 };
    }

    const { contractRet, confirmed, trc20TransferInfo } = transactionInfo;
    console.log(trc20TransferInfo[0]);
    const recipientAddress = trc20TransferInfo && trc20TransferInfo[0].to_address;
    if (recipientAddress !== config.TRC20_WALLET) {
        return { status: 'failed', amount: 0 };
    }

    if (confirmed === true && contractRet === 'SUCCESS') {
        const amountStr = trc20TransferInfo && trc20TransferInfo[0].amount_str;
        const decimals = trc20TransferInfo && trc20TransferInfo[0].decimals;
        const amount = parseInt(amountStr) / Math.pow(10, decimals);
        return { status: 'confirmed', amount: amount };
    } else if (confirmed === false) {
        return { status: 'pending', amount: 0 };
    } else {
        return { status: 'failed', amount: 0 };
    }
};