Using the stripe mock software for the Stripe payment testing
https://github.com/stripe/stripe-mock.git to run it command: go run main.go

Stripe Test Cards for Postman:
You can use the following test card numbers in the paymentToken when creating a payment method to simulate different outcomes.

Scenario	            Card Number	                Token (for Postman)
Successful Payment	    4242 4242 4242 4242	        tok_visa
Card Declined	        4000 0000 0000 0002	        tok_chargeDeclined
3D Secure Payment	    4000 0000 0000 9995	        tok_threeDSecure
Insufficient Funds	    4000 0000 0000 0341	        tok_chargeDeclinedInsufficientFunds
Invalid CVC	            4000 0000 0000 0101	        tok_chargeDeclinedCVCCheck
Expired Card	        4000 0000 0000 0069	        tok_chargeDeclinedExpiredCard


Summary of Header Requirements:
Endpoint	                                Authorization	Stripe Key Needed?	JWT Token Needed?
/payment/method	Stripe                        Secret Key	    Yes	                No
/payment/stripe/create	                      JWT Token	        Yes (Optional)	    Yes
/payment/stripe/cancel	                      JWT Token	        Yes (Optional)	    Yes
/payment/stripe/confirm	                      JWT Token	        Yes (Optional)	    Yes
/payment/subscription/:subscriptionId	      JWT Token	        Yes (Optional)	    Yes
/payment/:paymentId	                          JWT Token	        Yes (Optional)	    Yes


