const API_URL = 'http://localhost:8080/api';

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

$(document).ready(function() {
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();
        
        $.ajax({
            url: `${API_URL}/login`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(response) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                window.location.href = 'dashboard.html';
            },
            error: function(xhr) {
                $('#message').html(`
                    <div class="alert alert-danger">
                        ${xhr.responseJSON?.error || 'Login failed'}
                    </div>
                `);
            }
        });
    });

    if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        $('#usernameDisplay').text(`Welcome, ${user.username}`);
    }

    $('#logout').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.includes('items.html') ||
        window.location.pathname.includes('suppliers.html') ||
        window.location.pathname.includes('purchase.html')) {
        checkAuth();
    }
});

function ajaxRequest(config) {
    const token = localStorage.getItem('token');
    
    return $.ajax({
        ...config,
        headers: {
            ...config.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}

function formatRupiah(angka) {
    const num = typeof angka === 'string' ? parseFloat(angka) : angka;
    
    return num.toLocaleString('id-ID');
}