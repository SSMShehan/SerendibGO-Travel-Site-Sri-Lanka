const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  /**
   * Create a payment intent for a booking
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.bookingId - Booking ID
   * @param {number} paymentData.amount - Amount to pay
   * @param {string} paymentData.currency - Currency (default: lkr)
   * @param {string} paymentData.customerEmail - Customer email
   * @param {string} paymentData.tourTitle - Tour title
   * @returns {Promise<Object>} Payment intent result
   */
  static async createPaymentIntent(paymentData) {
    try {
      console.log('Creating payment intent with data:', paymentData);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount * 100, // Convert to cents
        currency: paymentData.currency || 'lkr',
        metadata: {
          bookingId: paymentData.bookingId.toString(), // Convert ObjectId to string
          customerEmail: paymentData.customerEmail || '',
          tourTitle: paymentData.tourTitle || ''
        },
        description: `Payment for ${paymentData.tourTitle || 'booking'}`,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        success: true
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment after successful Stripe payment
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<Object>} Payment verification result
   */
  static async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntent: paymentIntent,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        };
      } else {
        return {
          success: false,
          message: 'Payment not completed',
          status: paymentIntent.status
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment intent confirmation result
   */
  static async confirmPaymentIntent(paymentIntentId) {
    try {
      // First retrieve the payment intent to check its current status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // If already succeeded, return success
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          status: paymentIntent.status,
          paymentIntent: paymentIntent,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        };
      }
      
      // If not succeeded yet, try to confirm it
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
      if (confirmedPaymentIntent.status === 'succeeded') {
        return {
          success: true,
          status: confirmedPaymentIntent.status,
          paymentIntent: confirmedPaymentIntent,
          amount: confirmedPaymentIntent.amount,
          currency: confirmedPaymentIntent.currency,
          metadata: confirmedPaymentIntent.metadata
        };
      } else {
        return {
          success: false,
          message: 'Payment not completed',
          status: confirmedPaymentIntent.status
        };
      }
    } catch (error) {
      console.error('Payment intent confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve a payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment intent data
   */
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Payment intent retrieval error:', error);
      throw error;
    }
  }
}

module.exports = StripeService;
