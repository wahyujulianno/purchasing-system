$(document).ready(function() {
    if (!checkAuth()) return;

    let suppliers = [];
    let currentEditId = null;
    let currentDeleteId = null;

    loadSuppliers();

    $('#searchSupplierButton').click(searchSuppliers);
    $('#searchSupplier').on('keyup', function(e) {
        if (e.key === 'Enter') searchSuppliers();
    });

    $('#saveSupplierBtn').click(function() {
        const name = $('#supplierName').val().trim();
        const email = $('#supplierEmail').val().trim();
        const address = $('#supplierAddress').val().trim();

        if (!name) {
            showToast('Supplier name is required', 'danger');
            return;
        }

        const supplierData = {
            name: name,
            email: email || null,
            address: address || null
        };

        ajaxRequest({
            url: `${API_URL}/suppliers`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(supplierData)
        }).done(function(response) {
            $('#addSupplierModal').modal('hide');
            $('#addSupplierForm')[0].reset();
            showToast('Supplier added successfully!');
            loadSuppliers(); 
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to add supplier', 'danger');
        });
    });

    $(document).on('click', '.edit-supplier-btn', function() {
        const supplierId = $(this).data('id');
        const supplier = suppliers.find(s => s.id == supplierId);
        
        if (supplier) {
            currentEditId = supplierId;
            $('#editSupplierId').val(supplier.id);
            $('#editSupplierName').val(supplier.name);
            $('#editSupplierEmail').val(supplier.email || '');
            $('#editSupplierAddress').val(supplier.address || '');
            $('#editSupplierModal').modal('show');
        }
    });

    $('#updateSupplierBtn').click(function() {
        const id = $('#editSupplierId').val();
        const name = $('#editSupplierName').val().trim();
        const email = $('#editSupplierEmail').val().trim();
        const address = $('#editSupplierAddress').val().trim();

        if (!name) {
            showToast('Supplier name is required', 'danger');
            return;
        }

        const supplierData = {
            name: name,
            email: email || null,
            address: address || null
        };

        ajaxRequest({
            url: `${API_URL}/suppliers/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(supplierData)
        }).done(function(response) {
            $('#editSupplierModal').modal('hide');
            showToast('Supplier updated successfully!');
            loadSuppliers(); 
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to update supplier', 'danger');
        });
    });

    $(document).on('click', '.delete-supplier-btn', function() {
        const supplierId = $(this).data('id');
        const supplier = suppliers.find(s => s.id == supplierId);
        
        if (supplier) {
            currentDeleteId = supplierId;
            $('#deleteSupplierName').text(supplier.name);
            $('#deleteSupplierModal').modal('show');
        }
    });

    $('#confirmDeleteSupplierBtn').click(function() {
        if (!currentDeleteId) return;

        ajaxRequest({
            url: `${API_URL}/suppliers/${currentDeleteId}`,
            type: 'DELETE'
        }).done(function(response) {
            $('#deleteSupplierModal').modal('hide');
            showToast('Supplier deleted successfully!');
            loadSuppliers(); 
            currentDeleteId = null;
        }).fail(function(xhr) {
            showToast(xhr.responseJSON?.error || 'Failed to delete supplier', 'danger');
        });
    });

    function loadSuppliers() {
        $('#loadingSuppliers').show();
        $('#noSuppliers').hide();
        $('#suppliersTable tbody').empty();

        ajaxRequest({
            url: `${API_URL}/suppliers`,
            type: 'GET'
        }).done(function(data) {
            suppliers = data;
            renderSuppliers(suppliers);
        }).fail(function(xhr) {
            showToast('Failed to load suppliers', 'danger');
        }).always(function() {
            $('#loadingSuppliers').hide();
        });
    }

    function renderSuppliers(suppliersToRender) {
        const tbody = $('#suppliersTable tbody');
        tbody.empty();

        if (suppliersToRender.length === 0) {
            $('#noSuppliers').show();
            return;
        }

        suppliersToRender.forEach(supplier => {
            const date = new Date(supplier.created_at).toLocaleDateString();
            
            tbody.append(`
                <tr>
                    <td>${supplier.id}</td>
                    <td>${supplier.name}</td>
                    <td>${supplier.email || '-'}</td>
                    <td>${supplier.address ? supplier.address.substring(0, 50) + (supplier.address.length > 50 ? '...' : '') : '-'}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-supplier-btn" data-id="${supplier.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-supplier-btn" data-id="${supplier.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    function searchSuppliers() {
        const searchTerm = $('#searchSupplier').val().toLowerCase();
        if (!searchTerm) {
            renderSuppliers(suppliers);
            return;
        }

        const filteredSuppliers = suppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(searchTerm) ||
            (supplier.email && supplier.email.toLowerCase().includes(searchTerm)) ||
            (supplier.address && supplier.address.toLowerCase().includes(searchTerm)) ||
            supplier.id.toString().includes(searchTerm)
        );
        
        renderSuppliers(filteredSuppliers);
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