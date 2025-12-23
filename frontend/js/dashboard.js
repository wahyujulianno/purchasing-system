$(document).ready(function() {
    if (!checkAuth()) return;

    loadDashboardData();
    loadRecentPurchases();
    loadLowStockItems();
    
    setInterval(function() {
        if (document.visibilityState === 'visible') {
            loadDashboardData();
            loadRecentPurchases();
            loadLowStockItems();
        }
    }, 30000);

    function loadDashboardData() {
        ajaxRequest({
            url: `${API_URL}/items`,
            type: 'GET'
        }).done(function(items) {
            $('#totalItems').text(items.length);
            updateCardAnimation('#totalItems');
        });

        ajaxRequest({
            url: `${API_URL}/suppliers`,
            type: 'GET'
        }).done(function(suppliers) {
            $('#totalSuppliers').text(suppliers.length);
            updateCardAnimation('#totalSuppliers');
        });

        ajaxRequest({
            url: `${API_URL}/purchasings`,
            type: 'GET'
        }).done(function(purchases) {
            $('#totalPurchases').text(purchases.length);
            updateCardAnimation('#totalPurchases');
            
            let totalRevenue = 0;
            purchases.forEach(purchase => {
                totalRevenue += purchase.grand_total;
            });
            
            if ($('#totalRevenue').length === 0) {
                $('.row.mt-4 .col-md-4:last').after(`
                    <div class="col-md-4">
                        <div class="card bg-warning text-dark">
                            <div class="card-body">
                                <h5 class="card-title">Total Revenue</h5>
                                <h2 id="totalRevenue" class="card-text">Rp ${formatRupiah(totalRevenue)}</h2>
                            </div>
                        </div>
                    </div>
                `);
            } else {
                $('#totalRevenue').text(`Rp ${formatRupiah(totalRevenue)}`);
            }
        });

        setTimeout(() => {
            $('.card').addClass('fade-in');
        }, 300);
    }

    function loadRecentPurchases() {
        ajaxRequest({
            url: `${API_URL}/purchasings`,
            type: 'GET'
        }).done(function(purchases) {
            const recentPurchases = purchases.slice(0, 5);
            const tbody = $('#purchasesTable tbody');
            tbody.empty();

            if (recentPurchases.length === 0) {
                tbody.append(`
                    <tr>
                        <td colspan="4" class="text-center text-muted py-4">
                            <i class="bi bi-receipt display-4 d-block mb-3 opacity-50"></i>
                            No purchase history yet
                        </td>
                    </tr>
                `);
                return;
            }
            
            recentPurchases.forEach((purchase, index) => {
                const date = new Date(purchase.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                
                const supplierName = purchase.supplier?.name || 'N/A';
                const userName = purchase.user?.username || 'System';
                
                tbody.append(`
                    <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="purchase-icon me-3">
                                    <i class="bi bi-cart-check text-primary"></i>
                                </div>
                                <div>
                                    <strong>PO-${purchase.id.toString().padStart(4, '0')}</strong>
                                    <div class="text-muted small">By: ${userName}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="text-nowrap">${date}</div>
                            <div class="text-muted small">${formatTimeAgo(purchase.date)}</div>
                        </td>
                        <td>
                            <div class="supplier-info">
                                <strong>${supplierName}</strong>
                                ${purchase.supplier?.email ? `<div class="text-muted small">${purchase.supplier.email}</div>` : ''}
                            </div>
                        </td>
                        <td>
                            <div class="text-end">
                                <div class="text-rupiah fw-bold">Rp ${formatRupiah(purchase.grand_total)}</div>
                                <div class="text-muted small">
                                    ${purchase.details?.length || 0} items
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            });
            
            if (purchases.length > 5) {
                tbody.append(`
                    <tr>
                        <td colspan="4" class="text-center pt-3">
                            <a href="#" class="btn btn-sm btn-outline-primary" id="viewAllPurchases">
                                <i class="bi bi-arrow-right"></i> View All ${purchases.length} Purchases
                            </a>
                        </td>
                    </tr>
                `);
                
                $('#viewAllPurchases').click(function(e) {
                    e.preventDefault();
                    window.location.href = 'purchase.html?tab=history';
                });
            }
        }).fail(function(xhr) {
            $('#purchasesTable tbody').html(`
                <tr>
                    <td colspan="4" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle display-4 d-block mb-3"></i>
                        Failed to load purchase history
                    </td>
                </tr>
            `);
        });
    }

    function loadLowStockItems() {
        ajaxRequest({
            url: `${API_URL}/items`,
            type: 'GET'
        }).done(function(items) {
            const lowStockItems = items.filter(item => item.stock < 10);
            const tbody = $('#lowStockTable tbody');
            tbody.empty();

            if (lowStockItems.length === 0) {
                tbody.append(`
                    <tr>
                        <td colspan="3" class="text-center text-success py-4">
                            <i class="bi bi-check-circle display-4 d-block mb-3"></i>
                            All items have sufficient stock
                        </td>
                    </tr>
                `);
                return;
            }
            
            lowStockItems.sort((a, b) => a.stock - b.stock);
            
            lowStockItems.forEach((item, index) => {
                const stockPercentage = (item.stock / 10) * 100;
                const stockClass = item.stock === 0 ? 'stock-out' : 
                                  item.stock < 5 ? 'stock-low' : 'stock-warning';
                const stockText = item.stock === 0 ? 'Out of Stock' : 
                                 `${item.stock} units left`;
                
                tbody.append(`
                    <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="stock-indicator me-3 ${stockClass}"></div>
                                <div>
                                    <strong>${item.name}</strong>
                                    <div class="progress mt-1" style="height: 5px; width: 100px;">
                                        <div class="progress-bar ${getStockColorClass(item.stock)}" 
                                             style="width: ${stockPercentage}%"></div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="stock-status ${stockClass}">${stockText}</span>
                        </td>
                        <td>
                            <div class="text-end">
                                <div class="text-rupiah">Rp ${formatRupiah(item.price)}</div>
                                <button class="btn btn-sm btn-outline-primary mt-1 purchase-btn" 
                                        data-id="${item.id}" data-name="${item.name}">
                                    <i class="bi bi-cart-plus"></i> Purchase
                                </button>
                            </div>
                        </td>
                    </tr>
                `);
            });
            
            tbody.append(`
                <tr>
                    <td colspan="3" class="bg-light">
                        <div class="d-flex justify-content-between align-items-center p-2">
                            <div class="small text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                ${lowStockItems.length} items need attention
                            </div>
                            <a href="items.html?filter=low" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-box-arrow-up-right"></i> Manage Items
                            </a>
                        </div>
                    </td>
                </tr>
            `);
            
            $('.purchase-btn').click(function() {
                const itemId = $(this).data('id');
                const itemName = $(this).data('name');
                
                sessionStorage.setItem('quickPurchaseItem', JSON.stringify({
                    id: itemId,
                    name: itemName
                }));
                
                window.location.href = 'purchase.html';
            });
            
        }).fail(function(xhr) {
            $('#lowStockTable tbody').html(`
                <tr>
                    <td colspan="3" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle display-4 d-block mb-3"></i>
                        Failed to load inventory data
                    </td>
                </tr>
            `);
        });
    }

    function updateCardAnimation(cardElement) {
        $(cardElement)
            .css('transform', 'scale(1.1)')
            .delay(200)
            .queue(function(next) {
                $(this).css('transform', 'scale(1)');
                next();
            });
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('id-ID');
        }
    }

    function getStockColorClass(stock) {
        if (stock === 0) return 'bg-danger';
        if (stock < 5) return 'bg-warning';
        if (stock < 10) return 'bg-info';
        return 'bg-success';
    }

    if (!$('#dashboardStyles').length) {
        $('head').append(`
            <style id="dashboardStyles">
                .stock-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .stock-indicator.stock-out {
                    background-color: #ef476f;
                    box-shadow: 0 0 0 3px rgba(239, 71, 111, 0.2);
                }
                .stock-indicator.stock-low {
                    background-color: #ffd166;
                    box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.2);
                }
                .stock-indicator.stock-warning {
                    background-color: #118ab2;
                    box-shadow: 0 0 0 3px rgba(17, 138, 178, 0.2);
                }
                .purchase-icon {
                    width: 36px;
                    height: 36px;
                    background: rgba(67, 97, 238, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .progress {
                    border-radius: 10px;
                    overflow: hidden;
                }
                .progress-bar {
                    border-radius: 10px;
                }
            </style>
        `);
    }

    $(document).on('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            loadDashboardData();
        }
    });

    $('#refreshDashboard').click(function() {
        const btn = $(this);
        const originalHtml = btn.html();
        
        btn.html('<i class="bi bi-arrow-clockwise spin"></i> Refreshing...');
        btn.prop('disabled', true);
        
        $('head').append(`
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            </style>
        `);
        
        Promise.all([
            new Promise(resolve => {
                loadDashboardData();
                setTimeout(resolve, 500);
            }),
            new Promise(resolve => {
                loadRecentPurchases();
                setTimeout(resolve, 500);
            }),
            new Promise(resolve => {
                loadLowStockItems();
                setTimeout(resolve, 500);
            })
        ]).then(() => {
            showToast('Dashboard refreshed successfully!', 'success');
            
            setTimeout(() => {
                btn.html(originalHtml);
                btn.prop('disabled', false);
                $('.spin').remove();
            }, 1000);
        });
    });

    function showToast(message, type = 'success') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        
        if ($('#dashboardToast').length === 0) {
            $('body').append(`
                <div class="toast-container position-fixed top-0 end-0 p-3">
                    <div class="toast align-items-center text-white bg-${type} border-0" 
                         id="dashboardToast" role="alert">
                        <div class="d-flex">
                            <div class="toast-body" id="dashboardToastMessage"></div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                                    data-bs-dismiss="toast"></button>
                        </div>
                    </div>
                </div>
            `);
        }
        
        $('#dashboardToastMessage').text(message);
        $('#dashboardToast').removeClass('bg-success bg-danger bg-warning');
        $('#dashboardToast').addClass(`bg-${type}`);
        
        const toast = new bootstrap.Toast($('#dashboardToast')[0]);
        toast.show();
    }
});