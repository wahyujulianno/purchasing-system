$(document).ready(function() {
    if (!checkAuth()) return;

    let items = [];
    let currentEditId = null;
    let currentDeleteId = null;

    loadItems();

    $('#searchButton').click(searchItems);
    $('#searchItem').on('keyup', function(e) {
        if (e.key === 'Enter') searchItems();
    });

    $('#filterAll').click(function() {
        renderItems(items);
        updateActiveFilter('filterAll');
    });

    $('#filterLowStock').click(function() {
        const lowStockItems = items.filter(item => item.stock < 10);
        renderItems(lowStockItems);
        updateActiveFilter('filterLowStock');
    });

    $('#filterOutOfStock').click(function() {
        const outOfStockItems = items.filter(item => item.stock === 0);
        renderItems(outOfStockItems);
        updateActiveFilter('filterOutOfStock');
    });

    $('#saveItemBtn').click(function() {
        const name = $('#itemName').val().trim();
        const stock = parseInt($('#itemStock').val());
        const price = parseFloat($('#itemPrice').val());

        if (!name || isNaN(stock) || isNaN(price)) {
            showToast('Please fill all required fields correctly', 'danger');
            return;
        }

        const itemData = {
            name: name,
            stock: stock,
            price: price
        };

        ajaxRequest({
            url: `${API_URL}/items`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(itemData)
        }).done(function(response) {
            $('#addItemModal').modal('hide');
            $('#addItemForm')[0].reset();
            showToast('Item added successfully!');
            loadItems(); 
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to add item', 'danger');
        });
    });

    $(document).on('click', '.edit-item-btn', function() {
        const itemId = $(this).data('id');
        const item = items.find(i => i.id == itemId);
        
        if (item) {
            currentEditId = itemId;
            $('#editItemId').val(item.id);
            $('#editItemName').val(item.name);
            $('#editItemStock').val(item.stock);
            $('#editItemPrice').val(item.price);
            $('#editItemModal').modal('show');
        }
    });

    $('#updateItemBtn').click(function() {
        const id = $('#editItemId').val();
        const name = $('#editItemName').val().trim();
        const stock = parseInt($('#editItemStock').val());
        const price = parseFloat($('#editItemPrice').val());

        if (!name || isNaN(stock) || isNaN(price)) {
            showToast('Please fill all required fields correctly', 'danger');
            return;
        }

        const itemData = {
            name: name,
            stock: stock,
            price: price
        };

        ajaxRequest({
            url: `${API_URL}/items/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(itemData)
        }).done(function(response) {
            $('#editItemModal').modal('hide');
            showToast('Item updated successfully!');
            loadItems(); 
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to update item', 'danger');
        });
    });

    $(document).on('click', '.delete-item-btn', function() {
        const itemId = $(this).data('id');
        const item = items.find(i => i.id == itemId);
        
        if (item) {
            currentDeleteId = itemId;
            $('#deleteItemName').text(item.name);
            $('#deleteItemModal').modal('show');
        }
    });

    $('#confirmDeleteBtn').click(function() {
        if (!currentDeleteId) return;

        ajaxRequest({
            url: `${API_URL}/items/${currentDeleteId}`,
            type: 'DELETE'
        }).done(function(response) {
            $('#deleteItemModal').modal('hide');
            showToast('Item deleted successfully!');
            loadItems(); 
            currentDeleteId = null;
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to delete item', 'danger');
        });
    });

    function loadItems() {
        $('#loadingSpinner').show();
        $('#noItems').hide();
        $('#itemsTable tbody').empty();

        ajaxRequest({
            url: `${API_URL}/items`,
            type: 'GET'
        }).done(function(data) {
            items = data;
            renderItems(items);
        }).fail(function(xhr) {
            showToast('Failed to load items', 'danger');
        }).always(function() {
            $('#loadingSpinner').hide();
        });
    }

    function renderItems(itemsToRender) {
        const tbody = $('#itemsTable tbody');
        tbody.empty();

        if (itemsToRender.length === 0) {
            $('#noItems').show();
            return;
        }

        itemsToRender.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            const stockClass = item.stock === 0 ? 'text-danger fw-bold' : 
                              item.stock < 10 ? 'text-warning fw-bold' : '';
            const stockText = item.stock === 0 ? 'Out of Stock' : item.stock;

            tbody.append(`
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td class="${stockClass}">${stockText}</td>
                   <td>Rp ${formatRupiah(item.price)}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-item-btn" data-id="${item.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-item-btn" data-id="${item.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    function searchItems() {
        const searchTerm = $('#searchItem').val().toLowerCase();
        if (!searchTerm) {
            renderItems(items);
            return;
        }

        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.id.toString().includes(searchTerm)
        );
        
        renderItems(filteredItems);
    }

    function updateActiveFilter(activeFilterId) {
        $('#filterAll, #filterLowStock, #filterOutOfStock').removeClass('active');
        $(`#${activeFilterId}`).addClass('active');
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function showToast(message, type = 'success') {
        const toast = $('#successToast');
        const toastBody = $('#toastMessage');
        
        toastBody.text(message);
        toast.removeClass('bg-success bg-danger bg-warning');
        
        if (type === 'danger') {
            toast.addClass('bg-danger');
        } else if (type === 'warning') {
            toast.addClass('bg-warning');
        } else {
            toast.addClass('bg-success');
        }
        
        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
    }
});

function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}