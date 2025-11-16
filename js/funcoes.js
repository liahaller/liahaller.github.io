document.addEventListener('DOMContentLoaded', function () {

  const sim = document.querySelector('#sim');
  const nao = document.querySelector('#nao');

  function temBordaInline(el) {
    return !!el.style.border && el.style.border !== 'none';
  }

  sim.addEventListener('click', function () {
    if (!temBordaInline(sim)) {
      sim.style.border = '0.1rem solid black';
      nao.style.border = 'none';
    } else {
      sim.style.border = 'none';
    }
  });

  nao.addEventListener('click', function () {
    if (!temBordaInline(nao)) {
      nao.style.border = '0.1rem solid black';
      sim.style.border = 'none';
    } else {
      nao.style.border = 'none';
    }
  });

});
