// gallery.js
// Tạo vùng xem trước và gắn xử lý sự kiện cho các ảnh có class "product-image"
// Dựa trên cấu trúc của index.html trong repo (images có class product-image, section id="sanpham")

(function () {
  // Văn bản mặc định (tiếng Việt)
  var DEFAULT_TEXT = "Di chuột qua hình ảnh bên dưới để hiển thị tại đây";

  // Chờ DOM sẵn sàng
  document.addEventListener('DOMContentLoaded', function () {
    // Tìm section "sanpham" để chèn vùng hiển thị trước nó
    var sanpham = document.getElementById('sanpham');
    if (!sanpham) {
      console.warn('gallery.js: Không tìm thấy phần tử #sanpham. Vùng xem trước sẽ không được tạo.');
      return;
    }

    // Nếu đã có div#image (ví dụ bạn đã thêm thủ công trong HTML), dùng nó; nếu chưa, tạo mới
    var displayDiv = document.getElementById('image');
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
    // Lưu text gốc để undo có thể khôi phục (nếu người dùng đã đặt text khác)
    window.__galleryOriginalText = displayDiv.textContent || DEFAULT_TEXT;

    // Gắn event listeners cho tất cả ảnh thumbnail có class 'product-image'
    var thumbs = document.querySelectorAll('img.product-image');
    if (!thumbs || thumbs.length === 0) {
      console.warn('gallery.js: Không tìm thấy ảnh nào với class "product-image".');
      return;
    }

    thumbs.forEach(function (img) {
      // use mouseover/mouseout for desktop
      img.addEventListener('mouseover', function () { upDate(img); });
      img.addEventListener('mouseout', undo);

      // optional: touch devices - tap to show (toggles)
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

    var displayDiv = window.__galleryPreviewDiv || document.getElementById('image');
    if (!displayDiv) {
      console.error('upDate: không tìm thấy phần tử #image');
      return;
    }

    // Hiển thị ảnh làm background (bọc src trong dấu nháy đơn để an toàn)
    displayDiv.style.backgroundImage = "url('" + previewPic.src + "')";

    // Nếu muốn giữ văn bản overlay (mô tả), đặt alt vào textContent
    var text = previewPic.alt || '';
    displayDiv.textContent = text;
  };

  // Hàm hoàn tác khi chuột rời ảnh
  window.undo = function () {
    console.log('undo được gọi');
    var displayDiv = window.__galleryPreviewDiv || document.getElementById('image');
    if (!displayDiv) {
      console.error('undo: không tìm thấy phần tử #image');
      return;
    }

    // Reset background-image về giá trị gốc theo yêu cầu: background-image: url('')
    displayDiv.style.backgroundImage = "url('')";

    // Khôi phục lại văn bản gốc (nếu có), ngược lại dùng DEFAULT_TEXT
    displayDiv.textContent = window.__galleryOriginalText || DEFAULT_TEXT;
  };

})();