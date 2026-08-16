package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;
import com.parkingsystem.parkingsystem.entity.Payment;
import com.parkingsystem.parkingsystem.entity.PaymentStatus;
import com.parkingsystem.parkingsystem.entity.Ticket;
import com.parkingsystem.parkingsystem.repository.PaymentRepository;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.service.IPaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentImpl implements IPaymentService {
    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;
    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public PaymentOrderResponseDto createPaymentOrder(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).
                orElseThrow(() -> new RuntimeException("Ticket not found"));

        long amtInPaise = Math.round(ticket.getPrice() * 100);

        try {
            JSONObject options = new JSONObject();

            options.put("amount", amtInPaise);
            options.put("currency", "INR");
            options.put("receipt", ticket.getTicketNumber());

            Order order = razorpayClient.orders.create(options);
            Payment payment = new Payment();

            payment.setTicket(ticket);
            payment.setAmount(ticket.getPrice());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setRazorpayOrderId(order.get("id"));

            paymentRepository.save(payment);

            return new PaymentOrderResponseDto(order.get("id"), keyId, amtInPaise, "INR");
        }catch (RazorpayException e) {
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Override
    public void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElseThrow(
                () -> new RuntimeException("Payment not found"));

        try {
            JSONObject options = new JSONObject();

            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean verified = Utils.verifyPaymentSignature(options, keySecret);

            if(!verified) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);

                throw new RuntimeException("Payment verification failed");
            }
            // Payment is genuine
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
        }catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed", e);
        }
    }
}
