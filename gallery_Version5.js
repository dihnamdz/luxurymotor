// gallery_Version5.js (updated)
// Adds keyboard accessibility and automatic tabindex to <figure> items.
// Preserves existing preview behavior (mouseover, mouseout, click).
// - Adds focus/blur handlers (mirror mouseover/mouseout).
// - Adds keyboard activation (Enter / Space).
// - Adds a window 'load' handler that loops through figures and sets tabindex="0".
// - Logs to console for each important event so you can confirm behavior in devtools.

/* eslint-disable no-console */
(function () {
  // Văn bản mặc định (tiếng Việt)
  var DEFAULT_TEXT = "Di chuột qua hình ảnh bên dưới để hiển thị tại đây";

  // Lưu tham chiếu global cho vùng xem trước
  var displayDiv = null;

  // Tạo vùng preview khi DOM sẵn sàng (như trước)
  document.addEventListener('DOMContentLoaded', function () {
    // Tìm section "sanpham" để chèn vùng hiển thị trước nó
    var sanpham = document.getElementById('sanpham');
    if (!sanpham) {
      console.warn('gallery.js: Không tìm thấy phần tử #sanpham. Vùng xem trước sẽ không được tạo.');
      return;
    }

    // Nếu đã có div#image (ví dụ bạn đã thêm thủ công trong HTML), dùng nó; nếu chưa, tạo mới
    displayDiv = document.getElementById('image');
    if (!displayDiv) {
      displayDiv = document.createElement('div');
      displayDiv.id = 'image';
      // Thêm style cơ bản để hiển thị đẹp và tương thích với giao diện tối của trang
      displayDiv.style.width = '100%';
      displayDiv.style.maxWidth = '100%';
      displayDiv.style.height = '360px';
      displayDiv.style.borderRadius = '12px';
      displayDiv.style.overflow = 'hidden';
      displayDiv.style.backgroundColor = '#111';
      displayDiv.style.backgroundSize = 'cover';
      displayDiv.style.backgroundPosition = 'center';
      displayDiv.style.display = 'flex';
      displayDiv.style.alignItems = 'center';
      displayDiv.style.justifyContent = 'center';
      displayDiv.style.color = '#f7f7f7';
      displayDiv.style.fontSize = '1.25rem';
      displayDiv.style.fontWeight = '600';
      displayDiv.style.marginBottom = '1rem';
      displayDiv.style.border = '1px solid rgba(255,255,255,0.04)';
      displayDiv.style.boxShadow = '0 6px 24px rgba(0,0,0,0.6)';
      displayDiv.textContent = DEFAULT_TEXT;

      // Chèn vào DOM: trước section sanpham
      sanpham.parentNode.insertBefore(displayDiv, sanpham);
    } else {
      // Nếu đã có, lưu lại text gốc nếu cần và đảm bảo style hiển nhiên
      if (!displayDiv.textContent || displayDiv.textContent.trim() === '') {
        displayDiv.textContent = DEFAULT_TEXT;
      }
      displayDiv.style.backgroundSize = displayDiv.style.backgroundSize || 'cover';
      displayDiv.style.backgroundPosition = displayDiv.style.backgroundPosition || 'center';
    }

    // Lưu tham chiếu để các hàm upDate/undo sử dụng
    window.__galleryPreviewDiv = displayDiv;
    window.__galleryOriginalText = displayDiv.textContent || DEFAULT_TEXT;

    // Gắn event listeners cho tất cả ảnh thumbnail có class 'product-image'
    var thumbs = document.querySelectorAll('img.product-image');
    if (!thumbs || thumbs.length === 0) {
      console.warn('gallery.js: Không tìm thấy ảnh nào với class "product-image".');
      return;
    }

    thumbs.forEach(function (img) {
      // mouse events for desktop
      img.addEventListener('mouseover', function () { upDate(img); });
      img.addEventListener('mouseout', undo);

      // click: useful for touch and mouse users
      img.addEventListener('click', function (e) {
        // trên thiết bị cảm ứng, click sẽ gọi upDate và ngăn chặn link mặc định nếu có
        upDate(img);
      });
    });
  });

  // Hàm được gọi khi di chuột vào ảnh (hoặc khi click trên thiết bị cảm ứng)
  window.upDate = function (previewPic) {
    console.log('upDate được gọi:', previewPic);
    if (!previewPic || !previewPic.src) {
      console.warn('upDate: previewPic không hợp lệ', previewPic);
      return;
    }

    var display = window.__galleryPreviewDiv || document.getElementById('image');
    if (!display) {
      console.error('upDate: không tìm thấy phần tử #image');
      return;
    }

    // Hiển thị ảnh làm background (bọc src trong dấu nháy đơn để an toàn)
    display.style.backgroundImage = "url('" + previewPic.src + "')";

    // Nếu muốn giữ văn bản overlay (mô tả), đặt alt vào textContent
    var text = previewPic.alt || '';
    display.textContent = text;
  };

  // Hàm hoàn tác khi chuột rời ảnh hoặc blur
  window.undo = function () {
    console.log('undo được gọi');
    var display = window.__galleryPreviewDiv || document.getElementById('image');
    if (!display) {
      console.error('undo: không tìm thấy phần tử #image');
      return;
    }

    // Reset background-image về giá trị rỗng
    display.style.backgroundImage = "url('')";

    // Khôi phục lại văn bản gốc (nếu có), ngược lại dùng DEFAULT_TEXT
    display.textContent = window.__galleryOriginalText || DEFAULT_TEXT;
  };

  // --- New: add tabindex and keyboard/focus handlers on window load ---
  window.addEventListener('load', function addTabindexToFigures() {
    console.log('load event fired: adding tabindex and keyboard handlers to <figure> items');

    var figures = document.querySelectorAll('#sanpham figure');
    if (!figures || figures.length === 0) {
      console.warn('addTabindexToFigures: Không tìm thấy <figure> trong #sanpham.');
      return;
    }

    // Loop through each figure and add tabindex, role, and focus/blur/keydown handlers
    for (var i = 0; i < figures.length; i++) {
      (function (index) {
        var fig = figures[index];

        // add tabindex if missing
        if (!fig.hasAttribute('tabindex')) {
          fig.setAttribute('tabindex', '0');
          console.log('tabindex added to figure index:', index, 'caption:', fig.querySelector('figcaption')?.textContent || '');
        }

        // set role to button to indicate activation; keep it non-intrusive
        if (!fig.hasAttribute('role')) {
          fig.setAttribute('role', 'button');
        }

        // Focus handler (mirror mouseover)
        fig.addEventListener('focus', function () {
          console.log('figure focused (index):', index);
          // Prefer the thumbnail image inside the figure
          var img = fig.querySelector('img') || null;
          if (img) {
            upDate(img);
          } else {
            // fallback: add a CSS class highlight (if you style it)
            console.log('focus: no img found inside figure', fig);
          }
        });

        // Blur handler (mirror mouseout)
        fig.addEventListener('blur', function () {
          console.log('figure blur (index):', index);
          undo();
        });

        // Keyboard activation: Enter or Space triggers preview (same as click)
        fig.addEventListener('keydown', function (e) {
          var key = e.key;
          if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            console.log('figure activated by keyboard (index):', index);
            var img2 = fig.querySelector('img') || null;
            if (img2) {
              upDate(img2);
            }
          }
        });

        // Make the figure clickable via click too (if not already handled on the img)
        fig.addEventListener('click', function (ev) {
          console.log('figure clicked (index):', index);
          var img3 = fig.querySelector('img') || null;
          if (img3) {
            upDate(img3);
          }
        });
      })(i);
    }

    console.log('addTabindexToFigures: Completed; total figures processed =', figures.length);
  });

})();
