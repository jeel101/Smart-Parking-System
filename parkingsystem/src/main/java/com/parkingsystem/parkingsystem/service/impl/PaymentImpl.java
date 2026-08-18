package com.parkingsystem.parkingsystem.service.impl;

import com.parkingsystem.parkingsystem.dto.PaymentOrderResponseDto;
import com.parkingsystem.parkingsystem.entity.*;
import com.parkingsystem.parkingsystem.repository.BookingRepository;
import com.parkingsystem.parkingsystem.repository.PaymentRepository;
import com.parkingsystem.parkingsystem.repository.TicketRepository;
import com.parkingsystem.parkingsystem.service.IBookingService;
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
    private final BookingRepository bookingRepository;
    private final IBookingService iBookingService;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;
    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public PaymentOrderResponseDto createPaymentOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if(booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Booking is not awaiting payment");
        }

        long amtInPaise = Math.round(booking.getAmount() * 100);

        try {
            JSONObject options = new JSONObject();

            options.put("amount", amtInPaise);
            options.put("currency", "INR");
            options.put("receipt", "BOOKING-" + booking.getId());

            Order order = razorpayClient.orders.create(options);
            Payment payment = new Payment();

            payment.setBooking(booking);
            payment.setAmount(booking.getAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setRazorpayOrderId(order.get("id"));

            paymentRepository.save(payment);

            return new PaymentOrderResponseDto(order.get("id"), keyId, amtInPaise, "INR");
        }catch (RazorpayException e) {
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Override
    public Ticket verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
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

            //turn the paid hold into a real ticket.
            Ticket ticket = iBookingService.confirmBooking(payment.getBooking());
            payment.setTicket(ticket);

            paymentRepository.save(payment);
            return ticket;
        }catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed", e);
        }
    }
}
