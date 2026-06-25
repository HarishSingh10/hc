package com.food.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyRequest {
    private Long orderId;
    private String paymentId;
    private String razorpayOrderId;
    private String signature;
}
