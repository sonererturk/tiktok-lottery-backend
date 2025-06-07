const socket = io();

// Hata mesajları sözlüğü
const errorMessages = {
    // API Hataları
    '19881007': 'Böyle bir kullanıcı bulunamadı',
    'user_not_found': 'Böyle bir kullanıcı bulunamadı',
    'Failed to retrieve room_id from page source': 'Böyle bir kullanıcı bulunamadı',
    'LIVE has ended': 'Canlı yayın bulunamadı',
    'LIVE_HAS_ENDED': 'Canlı yayın bulunamadı',
    'Room not found': 'Canlı yayın bulunamadı',
    'room_not_found': 'Canlı yayın bulunamadı',
    
    // Bağlantı Hataları
    'connection_error': 'Bağlantı hatası oluştu',
    'network_error': 'İnternet bağlantınızı kontrol edin',
    'timeout': 'Bağlantı zaman aşımına uğradı',
    
    // Genel Hatalar
    'unknown_error': 'Bilinmeyen bir hata oluştu',
    'server_error': 'Sunucu hatası oluştu',
};

// Hata mesajlarını Türkçeleştirme
function handleError(error) {
    let errorMessage = 'Bilinmeyen bir hata oluştu';
    
    if (typeof error === 'string') {
        // String hata mesajlarını kontrol et
        for (const [key, value] of Object.entries(errorMessages)) {
            if (error.includes(key)) {
                errorMessage = value;
                break;
            }
        }
    } else if (error.message) {
        // Hata nesnesindeki mesajı kontrol et
        for (const [key, value] of Object.entries(errorMessages)) {
            if (error.message.includes(key)) {
                errorMessage = value;
                break;
            }
        }
    }
    
    showNotification(errorMessage, 'error');
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Varsa eski bildirimi kaldır
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Socket.io hata dinleyicisi
socket.on('error', (error) => {
    handleError(error);
});

// Diğer socket olayları
socket.on('connect', () => {
    showNotification('Sunucuya bağlanıldı', 'success');
});

socket.on('disconnect', () => {
    showNotification('Sunucu bağlantısı kesildi', 'error');
});

socket.on('winner-selected', (winner) => {
    showNotification(`Kazanan: ${winner}`, 'success');
});

// Genel hata yakalama
window.onerror = function(message, source, lineno, colno, error) {
    handleError(error || message);
    return false;
}; 