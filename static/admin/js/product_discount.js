/* Admin JavaScript for Product Discount Calculations */

(function() {
    function initDiscountCalculations() {
        const priceField = document.querySelector('#id_price');
        const discountActiveField = document.querySelector('#id_discount_active');
        const discountPercentField = document.querySelector('#id_discount_percent');
        const priceAfterDiscountField = document.querySelector('#id_price_after_discount');
        
        // Only initialize if we're on the product change/add page
        if (!priceField || !discountActiveField || !discountPercentField || !priceAfterDiscountField) {
            return;
        }
        
        let isUpdating = false; // Prevent circular updates

        // Function to toggle discount fields based on checkbox
        function toggleDiscountFields() {
            const isActive = discountActiveField.checked;
            discountPercentField.disabled = !isActive;
            priceAfterDiscountField.disabled = !isActive;
            
            // Clear fields when disabled
            if (!isActive) {
                discountPercentField.value = '';
                priceAfterDiscountField.value = '';
            }
        }

        // Function to calculate price after discount from percent
        function calculatePriceFromPercent() {
            if (isUpdating) return;
            
            const price = parseFloat(priceField.value) || 0;
            const discountPercent = parseFloat(discountPercentField.value) || 0;
            
            if (price > 0 && discountPercent >= 0 && discountPercent <= 100) {
                const discountAmount = (price * discountPercent) / 100;
                const priceAfterDiscount = price - discountAmount;
                
                isUpdating = true;
                priceAfterDiscountField.value = priceAfterDiscount.toFixed(2);
                isUpdating = false;
            } else if (discountPercent === 0) {
                isUpdating = true;
                priceAfterDiscountField.value = '';
                isUpdating = false;
            }
        }

        // Function to calculate discount percent from price after discount
        function calculatePercentFromPrice() {
            if (isUpdating) return;
            
            const price = parseFloat(priceField.value) || 0;
            const priceAfterDiscount = parseFloat(priceAfterDiscountField.value) || 0;
            
            if (price > 0 && priceAfterDiscount >= 0 && priceAfterDiscount < price) {
                const discountAmount = price - priceAfterDiscount;
                const discountPercent = (discountAmount / price) * 100;
                
                isUpdating = true;
                discountPercentField.value = discountPercent.toFixed(2);
                isUpdating = false;
            } else if (priceAfterDiscount === 0 || priceAfterDiscount >= price) {
                isUpdating = true;
                discountPercentField.value = '';
                isUpdating = false;
            }
        }

        // Function to validate and clear fields if needed
        function validateFields() {
            const price = parseFloat(priceField.value) || 0;
            const discountPercent = parseFloat(discountPercentField.value) || 0;
            const priceAfterDiscount = parseFloat(priceAfterDiscountField.value) || 0;
            
            // Clear discount fields if price is not set
            if (price <= 0) {
                discountPercentField.value = '';
                priceAfterDiscountField.value = '';
                return;
            }
            
            // Validate discount percent range
            if (discountPercent < 0 || discountPercent > 100) {
                alert('Discount percentage must be between 0 and 100');
                discountPercentField.focus();
                return;
            }
            
            // Validate price after discount
            if (priceAfterDiscount < 0 || (priceAfterDiscount > 0 && priceAfterDiscount >= price)) {
                alert('Price after discount must be less than the original price');
                priceAfterDiscountField.focus();
                return;
            }
        }

        // Add event listeners
        discountActiveField.addEventListener('change', toggleDiscountFields);
        
        priceField.addEventListener('input', function() {
            setTimeout(calculatePriceFromPercent, 100); // Small delay to prevent rapid calculations
        });
        
        priceField.addEventListener('blur', validateFields);

        discountPercentField.addEventListener('input', calculatePriceFromPercent);
        discountPercentField.addEventListener('blur', validateFields);

        priceAfterDiscountField.addEventListener('input', calculatePercentFromPrice);
        priceAfterDiscountField.addEventListener('blur', validateFields);

        // Initialize calculations on page load if values exist
        setTimeout(function() {
            toggleDiscountFields(); // Set initial state of discount fields
            
            if (discountPercentField.value) {
                calculatePriceFromPercent();
            } else if (priceAfterDiscountField.value) {
                calculatePercentFromPrice();
            }
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDiscountCalculations);
    } else {
        initDiscountCalculations();
    }

    // For inline editing in admin list view
    function initInlineDiscountCalculations() {
        const rows = document.querySelectorAll('.dynamic-form, tr');
        
        rows.forEach(function(row) {
            const priceInput = row.querySelector('input[name*="price"]:not([name*="discount"])');
            const discountPercentInput = row.querySelector('input[name*="discount_percent"]');
            const priceAfterDiscountInput = row.querySelector('input[name*="price_after_discount"]');
            
            if (priceInput && discountPercentInput && priceAfterDiscountInput) {
                let isUpdating = false;
                
                discountPercentInput.addEventListener('input', function() {
                    if (isUpdating) return;
                    
                    const price = parseFloat(priceInput.value) || 0;
                    const discountPercent = parseFloat(this.value) || 0;
                    
                    if (price > 0 && discountPercent >= 0 && discountPercent <= 100) {
                        const discountAmount = (price * discountPercent) / 100;
                        const priceAfterDiscount = price - discountAmount;
                        
                        isUpdating = true;
                        priceAfterDiscountInput.value = priceAfterDiscount.toFixed(2);
                        isUpdating = false;
                    }
                });
                
                priceAfterDiscountInput.addEventListener('input', function() {
                    if (isUpdating) return;
                    
                    const price = parseFloat(priceInput.value) || 0;
                    const priceAfterDiscount = parseFloat(this.value) || 0;
                    
                    if (price > 0 && priceAfterDiscount >= 0 && priceAfterDiscount < price) {
                        const discountAmount = price - priceAfterDiscount;
                        const discountPercent = (discountAmount / price) * 100;
                        
                        isUpdating = true;
                        discountPercentInput.value = discountPercent.toFixed(2);
                        isUpdating = false;
                    }
                });
            }
        });
    }

    // Also initialize for inline forms (changelist with editable fields)
    setTimeout(initInlineDiscountCalculations, 500);
})();