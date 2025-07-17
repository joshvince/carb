function enspuddify() {
  const enspuddificationCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('enspuddification='))
    ?.split('=')[1];

  if (enspuddificationCookie === 'true') {
    console.log('You have been enspuddified');

    document.querySelectorAll('.enspuddification').forEach((element) => {
      element.classList.remove('hidden');
    });

    document.querySelectorAll('.emoji-item').forEach((emoji) => {
      emoji.textContent = '🥔';
    });
  } else {
    document.querySelector('a#question').remove();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  enspuddify();
});

document.addEventListener('enspuddify', function () {
  enspuddify();
});
