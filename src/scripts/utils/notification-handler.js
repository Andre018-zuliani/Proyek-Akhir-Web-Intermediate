// src/scripts/utils/notification-handler.js

const NOTIFICATION_CONTAINER_ID = 'notification-container';
const NOTIFICATION_DISPLAY_TIME = 3000; // 3 detik

function showNotification(message) {
  const container = document.getElementById(NOTIFICATION_CONTAINER_ID);
  if (!container) {
    console.error('Notification container not found!');
    return;
  }

  const notificationItem = document.createElement('div');
  notificationItem.className = 'notification-item';
  notificationItem.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;

  container.appendChild(notificationItem);

  // Animate in
  requestAnimationFrame(() => {
    notificationItem.classList.add('show');
  });

  // Animate out and remove after some time
  setTimeout(() => {
    notificationItem.classList.remove('show');
    notificationItem.classList.add('hide');
    notificationItem.addEventListener(
      'animationend',
      () => {
        notificationItem.remove();
      },
      { once: true },
    );
  }, NOTIFICATION_DISPLAY_TIME);
}

export default showNotification;
