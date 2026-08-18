import { createPaymentOrder, verifyPayment } from "./PaymentService";

export const openRazorpayCheckout = async ({
    bookingId,
    description,
    onSuccess,
    onDismiss,
}) => {

    try {
        // Create Razorpay order from backend
        const order = await createPaymentOrder(bookingId);

        console.log("PAYMENT ORDER:", order);

        const options = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            order_id: order.orderId,

            name: "ParkEase",
            description: description || "Parking Payment",

            handler: async function (response) {

                console.log("RAZORPAY RESPONSE:", response);

                try {

                    const result = await verifyPayment({
                        razorpayOrderId:
                            response.razorpay_order_id,

                        razorpayPaymentId:
                            response.razorpay_payment_id,

                        razorpaySignature:
                            response.razorpay_signature,
                    });

                    console.log(
                        "VERIFICATION RESULT:",
                        result
                    );

                    // Give the ticket/result back to Slot.jsx
                    if (onSuccess) {
                        onSuccess(result);
                    }

                } catch (error) {

                    console.error(
                        "PAYMENT VERIFICATION FAILED:",
                        error
                    );

                    alert("Payment verification failed");
                }
            },

            modal: {
                ondismiss: function () {

                    console.log(
                        "Razorpay checkout closed"
                    );

                    if (onDismiss) {
                        onDismiss();
                    }
                },
            },
        };

        const razorpay =
            new window.Razorpay(options);

        razorpay.open();

    } catch (error) {

        console.error(
            "RAZORPAY ERROR:",
            error
        );

        console.error(
            "STATUS:",
            error.response?.status
        );

        console.error(
            "DATA:",
            error.response?.data
        );

        throw error;
    }
};