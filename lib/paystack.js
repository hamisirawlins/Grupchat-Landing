/**
 * Paystack Frontend Integration Utilities
 *
 * This module provides utilities for integrating Paystack payments
 * into the GrupChat frontend application.
 */

class PaystackIntegration {
  constructor() {
    this.publicKey = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Paystack with public key
   * @param {string} publicKey - Paystack public key
   */
  async initialize(publicKey) {
    try {
      this.publicKey = publicKey;

      // Load Paystack InlineJS script if not already loaded
      if (!window.PaystackPop) {
        await this.loadPaystackScript();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Paystack:", error);
      throw error;
    }
  }

  /**
   * Load Paystack InlineJS script
   */
  loadPaystackScript() {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize a payment transaction
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.email - Customer email
   * @param {number} paymentData.amount - Amount in dollars
   * @param {string} paymentData.reference - Transaction reference
   * @param {Function} paymentData.callback - Callback function
   * @param {Function} paymentData.onClose - Close callback function
   */
  async initializePayment(paymentData) {
    if (!this.isInitialized) {
      throw new Error("Paystack not initialized. Call initialize() first.");
    }

    if (!window.PaystackPop) {
      throw new Error("Paystack script not loaded");
    }

    const { email, amount, reference, callback, onClose } = paymentData;

    // Convert amount to cents (Paystack expects amount in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const handler = window.PaystackPop.setup({
      key: this.publicKey,
      email: email,
      amount: amountInCents,
      currency: "USD",
      ref: reference,
      callback: callback || this.defaultCallback,
      onClose: onClose || this.defaultOnClose,
    });

    handler.openIframe();
  }

  /**
   * Default callback function for successful payments
   * @param {Object} response - Payment response
   */
  defaultCallback(response) {
    console.log("Payment successful:", response);
    // This will be overridden by the actual callback
  }

  /**
   * Default close callback function
   */
  defaultOnClose() {
    console.log("Payment window closed");
    // This will be overridden by the actual close handler
  }

  /**
   * Verify payment status with backend
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(reference) {
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  }

  /**
   * Get supported banks for transfers
   * @param {string} country - Country code (default: US)
   * @returns {Promise<Array>} List of banks
   */
  async getBanks(country = "US") {
    try {
      const response = await fetch(`/api/paystack/banks?country=${country}`);
      const result = await response.json();

      if (result.success) {
        return result.data.banks;
      } else {
        throw new Error(result.message || "Failed to fetch banks");
      }
    } catch (error) {
      console.error("Failed to fetch banks:", error);
      throw error;
    }
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in dollars
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} Whether email is valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate bank account number
   * @param {string} accountNumber - Bank account number
   * @returns {boolean} Whether account number is valid
   */
  validateAccountNumber(accountNumber) {
    // Basic validation - account numbers are typically 8-17 digits
    const accountRegex = /^\d{8,17}$/;
    return accountRegex.test(accountNumber);
  }

  /**
   * Generate unique transaction reference
   * @param {string} poolId - Pool ID
   * @param {string} type - Transaction type (deposit/withdrawal)
   * @returns {string} Unique reference
   */
  generateReference(poolId, type = "deposit") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `grupchat_${type}_${poolId}_${timestamp}_${random}`;
  }
}

// Create singleton instance
export const paystackIntegration = new PaystackIntegration();

/**
 * React hook for Paystack integration
 * @param {string} publicKey - Paystack public key
 * @returns {Object} Paystack utilities and state
 */
export const usePaystack = (publicKey) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (publicKey) {
      paystackIntegration.initialize(publicKey).catch((err) => {
        setError(err.message);
      });
    }
  }, [publicKey]);

  const initializePayment = React.useCallback(async (paymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      await paystackIntegration.initializePayment(paymentData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = React.useCallback(async (reference) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await paystackIntegration.verifyPayment(reference);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBanks = React.useCallback(async (country = "US") => {
    try {
      setIsLoading(true);
      setError(null);
      const banks = await paystackIntegration.getBanks(country);
      return banks;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    initializePayment,
    verifyPayment,
    getBanks,
    isLoading,
    error,
    isInitialized: paystackIntegration.isInitialized,
  };
};

export default paystackIntegration;
