import apiClient from "../api/apiClient";

export const createPaymentOrder = async (bookingId) => {
    const response = await apiClient.post(
        `/payment/create-order/${bookingId}`
    );

    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await apiClient.post(
        "/payment/verify",
        paymentData
    );

    return response.data;
};

export const createExitPaymentOrder = async (ticketNumber) => {
    const response = await apiClient.post(`/payment/create-exit-order/${ticketNumber}`);
    return response.data;
}