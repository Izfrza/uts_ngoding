// ==================== SCRIPT JAVASCRIPT Fungsional untuk Tugas ====================

// ** PENTING: Jika kode masih tidak berfungsi, kemungkinan API Key Anda telah mencapai batas request atau tidak valid. **
const API_KEY = 'ccc1188fb8f6435a8f7f61bb9d8a215f'; 
const NEWS_BASE_URL = "https://newsapi.org/v2/";

// Selektor DOM
const NEWS_CARDS_CONTAINER = document.getElementById('newsCards');
const ALERT_BOX = document.getElementById('alertBox');
const QUERY_INPUT = document.getElementById('queryInput');
const API_SEARCH_FORM = document.getElementById('apiSearchForm');
const CLIENT_FILTER_INPUT = document.getElementById('clientFilterInput');
const SEARCH_BUTTON = document.getElementById('searchButton');
const SEARCH_SPINNER = document.getElementById('searchSpinner');

// Konstanta Pesan
const NO_TITLE_TEXT = 'Tidak Ada Judul';
const NO_SUMMARY_TEXT = 'Tidak ada ringkasan yang tersedia.';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/400x200?text=IZFRZA+NO+IMAGE';

// ===================================
// FUNGSI UTAMA NEWS API & TAMPILAN
// ===================================

/**
 * Mengatur status tombol pencarian dan spinner.
 * @param {boolean} isLoading - True untuk mode loading, False untuk mode normal.
 */
function toggleSearchLoading(isLoading) {
    SEARCH_BUTTON.disabled = isLoading;
    SEARCH_SPINNER.style.display = isLoading ? 'inline-block' : 'none';
    SEARCH_BUTTON.childNodes[1].nodeValue = isLoading ? ' Memproses...' : ' Cari Berita';
}

/**
 * Menampilkan pesan status atau error menggunakan alert Bootstrap.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {boolean} isError - True jika pesan error (merah), False jika sukses (hijau).
 */
function displayMessage(message, isError = true) {
    const alertClass = isError ? 'alert-danger' : 'alert-success';
    ALERT_BOX.innerHTML = `<div class="alert ${alertClass} text-center shadow-sm">${message}</div>`;
}

/**
 * Menampilkan animasi loading di area kartu berita.
 * @param {string} query - Query pencarian saat ini.
 */
function showCardLoading(query) {
    NEWS_CARDS_CONTAINER.innerHTML = `
        <div class="col-12 text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2 text-muted">${query ? `Mencari berita untuk: **${query}**...` : 'Memuat berita utama Indonesia...'}</p>
        </div>
    `;
    ALERT_BOX.innerHTML = ''; // Membersihkan pesan alert sebelumnya
}

/**
 * Mengambil berita dari News API.
 * @param {string} query - Kata kunci pencarian.
 */
async function fetchNews(query = '') {
    showCardLoading(query);
    toggleSearchLoading(true);

    let endpoint = 'top-headlines';
    let urlParams = `country=id&pageSize=6&apiKey=${API_KEY}`; 
    
    if (query) {
        endpoint = 'everything';
        // Menggunakan pageSize 15 untuk memastikan ketersediaan artikel yang cukup
        urlParams = `q=${encodeURIComponent(query)}&language=id&sortBy=relevancy&pageSize=15&apiKey=${API_KEY}`;
    }

    const NEWS_URL = `${NEWS_BASE_URL}${endpoint}?${urlParams}`;

    try {
        const response = await fetch(NEWS_URL);
        const data = await response.json();
        
        if (data.status === 'error') {
            // Pesan error spesifik dari API
            displayMessage(`[ERROR API]: ${data.message}. **Pastikan API Key valid dan belum mencapai batas request.**`);
        } else {
            // Filter artikel yang memiliki judul, deskripsi, dan gambar yang valid
            const validArticles = data.articles.filter(a => a.title && a.description && a.urlToImage);
            
            if (validArticles.length === 0) {
                 displayMessage(`Tidak ada berita valid yang ditemukan untuk kata kunci "**${query || 'Indonesia'}**".`, true);
                 NEWS_CARDS_CONTAINER.innerHTML = `<div class="col-12 text-center p-5 text-muted">Tidak ada artikel yang dapat ditampilkan.</div>`;
            } else {
                displayNews(validArticles);
                displayMessage(`Berhasil memuat ${validArticles.length} berita.`, false);
            }
        }
    } catch (error) {
        // Error jaringan atau CORS
        displayMessage('Terjadi kesalahan jaringan/koneksi. PASTIKAN Anda menjalankan file ini **melalui Live Server**, bukan langsung dari browser (file:///...).');
        console.error("Fetch Error:", error);
    } finally {
        toggleSearchLoading(false); // Selalu nonaktifkan loading setelah selesai
    }
}

/**
 * Merender kartu berita ke DOM.
 * @param {Array<Object>} articles - Daftar artikel berita.
 */
function displayNews(articles) {
    NEWS_CARDS_CONTAINER.innerHTML = '';
    
    // Tugas meminta minimal 6 kartu.
    const articlesToDisplay = articles; 

    if (articlesToDisplay.length < 6) {
         // Pesan peringatan jika kurang dari 6 kartu, tetapi tetap menampilkannya
         displayMessage(`Peringatan: Hanya ditemukan ${articlesToDisplay.length} kartu valid. Tugas meminta minimal 6.`, true);
    }

    articlesToDisplay.forEach(article => {
        const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        // Ringkasan 1-2 kalimat (ambil 120 karakter pertama dan tambahkan elipsis)
        const summaryText = (article.description || NO_SUMMARY_TEXT).substring(0, 120);
        const description = summaryText.length === 120 ? summaryText + '...' : summaryText;
        
        const cardHtml = `
            <div class="col-lg-4 col-md-6 mb-4 news-card-item">
                <div class="card h-100 shadow-sm">
                    <img src="${article.urlToImage || PLACEHOLDER_IMG}" 
                         class="card-img-top news-card-img" 
                         alt="Gambar berita"
                         onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary">${article.title || NO_TITLE_TEXT}</h5>
                        <p class="card-text small text-secondary">${description}</p>
                        <a href="${article.url || '#'}" target="_blank" class="btn btn-primary btn-sm mt-auto">Baca Selengkapnya</a>
                    </div>
                    <div class="card-footer text-muted small">
                        Dipublikasi: ${formattedDate}
                    </div>
                </div>
            </div>
        `;
        NEWS_CARDS_CONTAINER.innerHTML += cardHtml;
    });
}

// ===================================
// PENCARIAN SISI KLIEN (Filter Real-time)
// ===================================

/**
 * Melakukan filter real-time pada kartu berita yang sudah ada di DOM
 * berdasarkan judul.
 */
function filterNewsCards() {
    // Membersihkan alert box saat filtering
    ALERT_BOX.innerHTML = ''; 
    
    const filterValue = CLIENT_FILTER_INPUT.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.news-card-item');
    let foundCount = 0;

    cards.forEach(card => {
        const titleElement = card.querySelector('.card-title');
        const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
        
        // Filter berdasarkan judul
        if (titleText.includes(filterValue)) {
            card.style.display = 'block'; 
            foundCount++;
        } else {
            card.style.display = 'none'; 
        }
    });
    
    // Tampilkan pesan jika tidak ada yang ditemukan
    if (cards.length > 0 && foundCount === 0) {
        displayMessage(`Tidak ada berita yang judulnya mengandung kata kunci "**${filterValue}**".`, true);
    } else if (filterValue !== '' && foundCount > 0) {
        // Tampilkan jumlah hasil filtering, hanya jika filter tidak kosong
        displayMessage(`Ditemukan ${foundCount} kartu berita yang cocok dengan filter.`, false);
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

// 1. Event Listener untuk pencarian API (saat form disubmit)
API_SEARCH_FORM.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = QUERY_INPUT.value.trim();
    if (query) {
         fetchNews(query);
    } else {
         displayMessage('Harap masukkan kata kunci pencarian.', true);
    }
});

// 2. Event Listener untuk filtering client-side (saat tombol dilepas/keyup)
// Catatan: Tombol "Filter" yang statis pada HTML tidak diperlukan karena menggunakan 'keyup'.
CLIENT_FILTER_INPUT.addEventListener('keyup', filterNewsCards);


// Muat berita utama (default) saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', () => fetchNews());