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

$('#rsvp').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#guestName').value.trim();
  if (!name) { $('#guestName').focus(); return; }
  const inviter = $('#inviter').value.trim();
  const count = $('#guestCount').value;
  const note = $('#guestNote').value.trim();
  // User input is assigned as plain text; it is never interpreted as HTML.
  $('#replyText').value = `Kính gửi ${inviter || 'người mời'}, tôi là ${name}. Cảm ơn lời mời tới Dáng Hình Của Yêu Thương của Cảm Xúc Club. Tôi đăng ký tham dự cùng người thân, tổng cộng ${count} người, lúc 19:30 ngày 18/10/2026 tại Vịnh Hoàng Hôn, Hạ Long. Xin phản hồi để xác nhận việc đón tiếp.${note ? '\nLời nhắn: ' + note : ''}`;
  $('#replyOutput').hidden = false;
  $('#replyText').focus();
  $('#replyStatus').textContent = 'Lời báo đã sẵn sàng. Hãy gửi cho người đã mời anh chị.';
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
