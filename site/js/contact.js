const form = document.getElementById('contactForm');
if (form) {
  const resp = document.getElementById('formResponse');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resp.textContent = '';
    let valid = true;
 
    form.querySelectorAll('.field').forEach(f => {
      const input = f.querySelector('input, textarea');
      const error = f.querySelector('.error');
      if (input.hasAttribute('required') && !input.value.trim()) {
        error.textContent = 'This field is required';
        valid = false;
      } else if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value.trim())) {
        error.textContent = 'Enter a valid email';
        valid = false;
      } else {
        error.textContent = '';
      }
    });
 
    if (!valid) {
      resp.style.color = '#ff9b9b';
      resp.textContent = 'Please fix the highlighted fields.';
      return;
    }
 
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone?.value.trim() || '',
      message: form.message.value.trim()
    };
 
    try {
      const r = await fetch('https://modus-electronics.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to send');
 
      resp.style.color = '#a0e9a0';
      resp.textContent = 'Thank you! Your message has been sent.';
      form.reset();
    } catch (err) {
      resp.style.color = '#ff9b9b';
      resp.textContent = 'Something went wrong. Please email mahirdhariwal@gmail.com';
      console.error(err);
    }
  });
}
