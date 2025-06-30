// Payment functionality for AgroCulture

class PaymentManager {
    constructor() {
        this.razorpay = null;
        this.paymentsClient = null;
        this.upiId = '6381672467@paytm'; // Your UPI ID
        this.initEventListeners();
        this.initGooglePay();
    }

    initEventListeners() {
        // Subscription payment button
        const paySubscriptionBtn = document.getElementById('pay-subscription');
        if (paySubscriptionBtn) {
            paySubscriptionBtn.addEventListener('click', this.handleSubscriptionPayment.bind(this));
        }
    }

    async initGooglePay() {
        if (typeof google !== 'undefined' && google.payments) {
            try {
                this.paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
                
                // Check if Google Pay is available
                const isReadyToPayRequest = {
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                        {
                            type: 'UPI',
                            parameters: {
                                payeeVpa: this.upiId,
                                payeeName: 'AgriToday',
                                transactionNote: 'AgriToday Subscription'
                            }
                        }
                    ]
                };

                const isReadyToPay = await this.paymentsClient.isReadyToPay(isReadyToPayRequest);
                
                if (isReadyToPay.result) {
                    this.addGooglePayButton();
                }
            } catch (error) {
                console.log('Google Pay not available:', error);
            }
        }
    }

    addGooglePayButton() {
        const payButton = document.getElementById('pay-subscription');
        if (payButton) {
            // Add Google Pay option
            const googlePayBtn = document.createElement('button');
            googlePayBtn.className = 'btn btn-outline btn-full';
            googlePayBtn.innerHTML = '💳 Pay with Google Pay / UPI';
            googlePayBtn.onclick = () => this.initiateGooglePay();
            
            payButton.parentNode.insertBefore(googlePayBtn, payButton.nextSibling);
        }
    }

    async initiateGooglePay() {
        try {
            const paymentDataRequest = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [
                    {
                        type: 'UPI',
                        parameters: {
                            payeeVpa: this.upiId,
                            payeeName: 'AgriToday',
                            transactionNote: 'AgriToday Subscription - ₹49',
                            transactionRef: 'AGT' + Date.now()
                        },
                        tokenizationSpecification: {
                            type: 'DIRECT'
                        }
                    }
                ],
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: '49.00',
                    currencyCode: 'INR'
                },
                merchantInfo: {
                    merchantName: 'AgriToday',
                    merchantId: '12345678901234567890'
                }
            };

            const paymentData = await this.paymentsClient.loadPaymentData(paymentDataRequest);
            this.onGooglePaySuccess(paymentData);
        } catch (error) {
            this.onGooglePayError(error);
        }
    }

    onGooglePaySuccess(paymentData) {
        console.log('Google Pay payment success:', paymentData);
        
        // Activate subscription
        localStorage.setItem('subscription-active', 'true');
        localStorage.setItem('subscription-start', new Date().toISOString());
        
        // Close modal and show success
        const modal = document.getElementById('subscription-modal');
        if (modal) modal.style.display = 'none';
        
        showNotification('Payment successful! Your subscription is now active.', 'success');
    }

    onGooglePayError(error) {
        console.error('Google Pay payment error:', error);
        showNotification('Google Pay payment failed. Please try again.', 'error');
    }

    async handleSubscriptionPayment() {
        try {
            const amount = 4900; // ₹49 in paise
            
            // Show payment options modal
            this.showPaymentOptionsModal(amount);

        } catch (error) {
            showNotification(error.message || 'Payment failed', 'error');
        }
    }

    showPaymentOptionsModal(amount) {
        // Create payment options modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Choose Payment Method</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="payment-options">
                        <div class="payment-amount">
                            <h3>Subscription: ₹49/month</h3>
                        </div>
                        <div class="payment-methods">
                            <button class="btn btn-primary btn-full upi-pay-btn">
                                📱 Pay via UPI (${this.upiId})
                            </button>
                            <button class="btn btn-outline btn-full razorpay-btn">
                                💳 Pay with Card/Wallet
                            </button>
                            <button class="btn btn-success btn-full gpay-btn">
                                🟢 Google Pay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.upi-pay-btn').addEventListener('click', () => {
            this.initiateUPIPayment(amount);
            modal.remove();
        });

        modal.querySelector('.razorpay-btn').addEventListener('click', () => {
            this.simulatePayment(amount).then(() => {
                this.onPaymentSuccess();
            });
            modal.remove();
        });

        modal.querySelector('.gpay-btn').addEventListener('click', () => {
            this.initiateGooglePay();
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    initiateUPIPayment(amount) {
        const upiUrl = `upi://pay?pa=${this.upiId}&pn=AgriToday&tn=AgriToday%20Subscription&am=49.00&cu=INR&tr=AGT${Date.now()}`;
        
        // Try to open UPI app
        window.open(upiUrl, '_blank');
        
        // Show confirmation dialog
        setTimeout(() => {
            if (confirm('Have you completed the payment? Click OK if payment was successful.')) {
                this.onPaymentSuccess();
            }
        }, 3000);
    }

    onPaymentSuccess() {
        // Activate subscription
        localStorage.setItem('subscription-active', 'true');
        localStorage.setItem('subscription-start', new Date().toISOString());
        
        // Close subscription modal
        const modal = document.getElementById('subscription-modal');
        if (modal) modal.style.display = 'none';
        
        showNotification('Payment successful! Your subscription is now active.', 'success');
    }

    // Simulate payment for demo
    async simulatePayment(amount) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful payment
                resolve({
                    payment_id: 'pay_demo_' + Date.now(),
                    order_id: 'order_demo_' + Date.now(),
                    signature: 'signature_demo_' + Date.now()
                });
            }, 2000);
        });
    }

    // For actual Razorpay integration when backend is ready
    async initiateRazorpayPayment(amount, orderId) {
        return new Promise((resolve, reject) => {
            const options = {
                key: 'your_razorpay_key', // Replace with actual key
                amount: amount,
                currency: 'INR',
                name: 'AgroCulture',
                description: 'Subscription Payment',
                order_id: orderId,
                handler: function (response) {
                    resolve(response);
                },
                prefill: {
                    name: authManager?.currentUser?.name || '',
                    email: authManager?.currentUser?.email || '',
                    contact: authManager?.currentUser?.phone || ''
                },
                theme: {
                    color: '#2ECC71'
                },
                modal: {
                    ondismiss: function() {
                        reject(new Error('Payment cancelled'));
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
        });
    }

    // Verify payment with backend
    async verifyPayment(paymentData) {
        try {
            // This will be used when backend is deployed
            return await paymentsAPI.verifyPayment(paymentData);
        } catch (error) {
            throw new Error('Payment verification failed');
        }
    }
}

// Initialize payment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.paymentManager = new PaymentManager();
});
