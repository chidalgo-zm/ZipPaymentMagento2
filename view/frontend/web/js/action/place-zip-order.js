/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define(
  [   'jquery',
      'Magento_Checkout/js/model/quote',
      'Magento_Checkout/js/model/url-builder',
      'mage/storage',
      'mage/url',
      'Magento_Checkout/js/model/error-processor',
      'Magento_Customer/js/model/customer',
      'Magento_Checkout/js/model/full-screen-loader',
      'Magento_Ui/js/lib/core/class',
      'Magento_Customer/js/customer-data'
  ],
  function ($, quote, urlBuilder, storage, url, errorProcessor, customer, fullScreenLoader, Class, customerData) {
    'use strict';
    return Class.extend({
      paymentData:null,
      initialize:function(paymentData, messageContainer){
        this.paymentData = paymentData;
        Zip.Checkout.init({
          redirect: window.checkoutConfig.payment.zippayment.inContextCheckoutEnabled ? 0 : 1,
          checkoutUri: window.checkoutConfig.payment.zippayment.checkoutUri,
          redirectUri: window.checkoutConfig.payment.zippayment.redirectUri,
          onComplete: this.onComplete.bind(this),
          onError: this.onError.bind(this),
          onCheckout: this.onCheckout.bind(this)
        });     
      },
      onComplete: function(response){    
        if(response.state == "approved" || response.state == "referred"){
          customerData.invalidate(['cart']);
          location.href = window.checkoutConfig.payment.zippayment.redirectUri + "?result="+response.state+"&checkoutId=" + response.checkoutId;
        } else {
          fullScreenLoader.stopLoader();
        }
      },
      onError: function(response){                      
        fullScreenLoader.stopLoader();
        alert("An error occurred while getting the redirect url from zipMoney.");
      },
      onCheckout: function(resolve, reject, args){            
        fullScreenLoader.startLoader();
        var payload = null;
        /** Checkout for guest and registered customer. */
    
        try{
          storage.get(
              window.checkoutConfig.payment.zippayment.checkoutUri
          ).done(function (data) {
            resolve({
              data: {redirect_uri: data.redirect_uri}
            });
          }).fail(function (data) {
            reject();
          }).always(function (data) {
            fullScreenLoader.stopLoader(); 
          });
        } catch(e){
          console.log(e);
        }
      }
    });
  }
);
