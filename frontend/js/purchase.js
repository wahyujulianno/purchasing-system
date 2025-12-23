$(document).ready(function() {
    if (!checkAuth()) return;

    let cart = [];
    let suppliers = [];
    let items = [];

    loadSuppliers();
    loadItems();

    function loadSuppliers() {
        ajaxRequest({
            url: `${API_URL}/suppliers`,
            type: 'GET'
        }).done(function(data) {
            suppliers = data;
            const select = $('#supplierSelect');
            select.empty();
            select.append('<option value="">Choose supplier...</option>');
            
            suppliers.forEach(supplier => {
                select.append(`<option value="${supplier.id}">${supplier.name}</option>`);
            });
        });
    }

    function loadItems() {
        ajaxRequest({
            url: `${API_URL}/items`,
            type: 'GET'
        }).done(function(data) {
            items = data;
            const select = $('#itemSelect');
            select.empty();
            select.append('<option value="">Choose item...</option>');
            
            items.forEach(item => {
    select.append(`<option value="${item.id}">${item.name} - Stock: ${item.stock} - Rp ${formatRupiah(item.price)}</option>`);
});
        });
    }

    $('#supplierSelect').change(function() {
        const supplierId = $(this).val();
        const supplier = suppliers.find(s => s.id == supplierId);
        
        if (supplier) {
            $('#supplierInfo').html(`
                <div class="alert alert-info">
                    <strong>${supplier.name}</strong><br>
                    Email: ${supplier.email || 'N/A'}<br>
                    Address: ${supplier.address || 'N/A'}
                </div>
            `);
            checkSubmitButton();
        } else {
            $('#supplierInfo').empty();
        }
    });

    $('#addToCart').click(function() {
        const itemId = $('#itemSelect').val();
        const qty = parseInt($('#qty').val());
        
        if (!itemId || !qty || qty < 1) {
            alert('Please select an item and enter valid quantity');
            return;
        }

        const item = items.find(i => i.id == itemId);
        if (!item) return;

        const existingIndex = cart.findIndex(ci => ci.item_id == itemId);
        
        if (existingIndex > -1) {
            cart[existingIndex].qty += qty;
            cart[existingIndex].subtotal = cart[existingIndex].qty * item.price;
        } else {
            cart.push({
                item_id: item.id,
                item_name: item.name,
                qty: qty,
                price: item.price,
                subtotal: qty * item.price
            });
        }

        updateCartDisplay();
        $('#qty').val(1);
    });

    function updateCartDisplay() {
    const tbody = $('#cartTable tbody');
    tbody.empty();
    
    let grandTotal = 0;
    
    cart.forEach((item, index) => {
        grandTotal += item.subtotal;
        tbody.append(`
            <tr>
                <td>${item.item_name}</td>
                <td>${item.qty}</td>
                <td>Rp ${formatRupiah(item.price)}</td>
                <td>Rp ${formatRupiah(item.subtotal)}</td>
                <td>
                    <button class="btn btn-danger btn-sm remove-item" data-index="${index}">Remove</button>
                </td>
            </tr>
        `);
    });

    $('#grandTotal').text(formatRupiah(grandTotal));
    checkSubmitButton();
}

    $(document).on('click', '.remove-item', function() {
        const index = $(this).data('index');
        cart.splice(index, 1);
        updateCartDisplay();
    });

    function checkSubmitButton() {
        const supplierSelected = $('#supplierSelect').val();
        const hasItems = cart.length > 0;
        
        $('#submitOrder').prop('disabled', !(supplierSelected && hasItems));
    }

    $('#submitOrder').click(function() {
        const supplierId = $('#supplierSelect').val();
        
        if (!supplierId || cart.length === 0) {
            alert('Please select a supplier and add items to cart');
            return;
        }

        const orderData = {
            supplier_id: parseInt(supplierId),
            details: cart.map(item => ({
                item_id: item.item_id,
                qty: item.qty
            }))
        };

        ajaxRequest({
            url: `${API_URL}/purchasings`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData)
        }).done(function(response) {
            const modal = new bootstrap.Modal(document.getElementById('successModal'));
            modal.show();
            
            cart = [];
            updateCartDisplay();
            $('#supplierSelect').val('');
            $('#supplierInfo').empty();
            $('#itemSelect').val('');
            
            loadItems();
        }).fail(function(xhr) {
            alert('Error: ' + (xhr.responseJSON?.error || 'Failed to create purchase order'));
        });
    });
});

function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}