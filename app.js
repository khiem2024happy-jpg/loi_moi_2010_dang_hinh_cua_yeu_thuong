'use strict';

// The event is expressed in UTC so calendar imports preserve Vietnam time.
const EVENT = Object.freeze({
  title: 'Dáng Hình Của Yêu Thương - Cảm Xúc Club',
  location: 'Vịnh Hoàng Hôn - Hạ Long - Quảng Ninh',
  start: '20261018T123000Z',
  end: '20261018T150000Z',
});
const $ = (selector) => document.querySelector(selector);
const replyDialog = $('#replyDialog');
const imageDialog = $('#imageDialog');

function closeOnBackdrop(modal) {
  modal.addEventListener('click', (event) => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
}
closeOnBackdrop(replyDialog);
closeOnBackdrop(imageDialog);
$('#reply').addEventListener('click', () => replyDialog.showModal());
$('#mobileReply').addEventListener('click', () => replyDialog.showModal());
$('#close').addEventListener('click', () => replyDialog.close());
$('#imageClose').addEventListener('click', () => imageDialog.close());

let requestId = null;
let submittedPayload = '';
$('#rsvp').addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = $('#guestName').value.trim();
  const phone = $('#guestPhone').value.trim();
  const count = Number($('#guestCount').value);
  const inviter = $('#inviter').value.trim();
  const note = $('#guestNote').value.trim();
  const status = $('#replyStatus');
  if (!name || !/^[+\d ().-]{8,20}$/.test(phone)) {
    status.textContent = 'Xin kiểm tra tên và số điện thoại của anh chị.';
    return;
  }
  const payload = {name, phone, count, inviter, note, consent: $('#consent').checked, website: $('#website').value};
  const fingerprint = JSON.stringify(payload);
  if (fingerprint !== submittedPayload) {
    requestId = crypto.randomUUID();
    submittedPayload = fingerprint;
  }
  const button = $('#submitRegistration');
  button.disabled = true;
  button.textContent = 'Đang gửi…';
  status.textContent = 'Xin chờ trong giây lát.';
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...payload, requestId}),
      signal: AbortSignal.timeout(25000),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || 'Chưa gửi được đăng ký. Xin thử lại hoặc liên hệ fanpage.');
    $('#replyText').value = `Tôi là ${name}. Tôi đã gửi đăng ký tham dự Dáng Hình Của Yêu Thương của Cảm Xúc Club, tổng cộng ${count} người, lúc 19:30 ngày 18/10/2026 tại Vịnh Hoàng Hôn, Hạ Long. Mã đăng ký: ${requestId}.`;
    $('#replyOutput').hidden = false;
    status.textContent = 'Cảm ơn anh chị! Ban tổ chức đã nhận thông tin và sẽ liên hệ xác nhận. Mã đăng ký: ' + requestId;
    button.textContent = 'Đã nhận đăng ký';
  } catch (error) {
    status.textContent = error.name === 'TimeoutError' ? 'Chưa xác định được kết quả gửi. Xin thử lại; cùng một đăng ký sẽ không bị ghi trùng.' : error.message;
    button.disabled = false;
    button.textContent = 'Gửi lại đăng ký';
  }
});

$('#copyReply').addEventListener('click', async () => {
  const field = $('#replyText');
  try {
    if (navigator.share) {
      await navigator.share({title: 'Báo tham dự Cảm Xúc Club', text: field.value});
      $('#replyStatus').textContent = 'Xin kiểm tra lời nhắn đã gửi cho người mời.';
    } else {
      await navigator.clipboard.writeText(field.value);
      $('#replyStatus').textContent = 'Đã sao chép. Hãy dán vào tin nhắn gửi người mời.';
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    field.focus();
    field.select();
    $('#replyStatus').textContent = 'Anh chị có thể sao chép nội dung được chọn và gửi người mời.';
  }
});

function escapeCalendarText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
// RFC 5545 lines are folded at 75 UTF-8 bytes, without splitting characters.
function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  let output = '', bytes = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (bytes + length > 75) { output += '\r\n '; bytes = 1; }
    output += character;
    bytes += length;
  }
  return output;
}
$('#calendar').addEventListener('click', () => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN',
    'PRODID:-//Cam Xuc Club//VIP Invitation//VN', 'BEGIN:VEVENT',
    'UID:camxuc-vip-20261018@camxuc', `DTSTAMP:${stamp}`,
    `DTSTART:${EVENT.start}`, `DTEND:${EVENT.end}`,
    `SUMMARY:${escapeCalendarText(EVENT.title)}`,
    `LOCATION:${escapeCalendarText(EVENT.location)}`,
    'DESCRIPTION:Xin xác nhận trực tiếp với người mời về việc tham dự và đón tiếp.',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const url = URL.createObjectURL(new Blob([lines.map(foldCalendarLine).join('\r\n') + '\r\n'], {type: 'text/calendar;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'thu-moi-cam-xuc-club.ics';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#calendarStatus').textContent = 'Đã tải tệp lịch. Mở tệp để thêm cuộc hẹn vào lịch của anh chị.';
});

// Bind only content images; the lightbox's original-image link remains usable.
document.querySelectorAll('main a[href^="assets/"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const image = link.querySelector('img');
    $('#largeImage').src = link.getAttribute('href');
    $('#largeImage').alt = image?.alt || 'Minh họa sân khấu chương trình';
    $('#imageLabel').textContent = 'Hình ảnh chương trình';
    $('#fullImage').href = link.href;
    imageDialog.showModal();
  });
});

const progress = $('.scroll-progress');
let framePending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const value = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
  progress.style.transform = `scaleX(${value})`;
  framePending = false;
}
function queueProgress() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateProgress);
}
window.addEventListener('scroll', queueProgress, {passive: true});
window.addEventListener('resize', queueProgress);
updateProgress();
