if (!sessionStorage.getItem('hcnp')) {
  document.body.style.display = 'none';
  if (prompt("password") !== 'hardcore') {
    window.location.href = 'https://liquiddeath.com/'
  } else {
    sessionStorage.setItem('hcnp', '1');
    document.body.style.display = 'block';
  }
}